package nhb.vn.be.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nhb.vn.be.dto.request.AppointmentRequest;
import nhb.vn.be.dto.response.AppointmentResponse;
import nhb.vn.be.dto.response.PaymentResponseDTO;
import nhb.vn.be.entity.Doctor;
import nhb.vn.be.entity.Patient;
import nhb.vn.be.entity.Schedule;
import nhb.vn.be.exception.AppException;
import nhb.vn.be.exception.ErrorCode;
import nhb.vn.be.repository.AppointmentRepository;
import nhb.vn.be.repository.DoctorRepository;
import nhb.vn.be.repository.PatientRepository;
import nhb.vn.be.repository.ScheduleRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * BookingFlowService — quản lý toàn bộ luồng đặt lịch khám qua chatbot.
 *
 * Responsibilities:
 *  - Tạo / xác nhận / hủy BookingSession
 *  - Kiểm tra xác thực người dùng (unauthenticated → "đăng nhập")
 *  - Kiểm tra giờ làm việc hợp lệ (8-12h, 14-17h)
 *  - Kiểm tra xung đột lịch hẹn và gợi ý khung giờ khác
 *  - TTL 30 phút cho BookingSession (cleanup mỗi 60 giây)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BookingFlowService {

    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final ScheduleRepository scheduleRepository;
    private final AppointmentRepository appointmentRepository;
    private final AppointmentService appointmentService;
    private final PaymentService paymentService;

    /** In-memory session store: userId → BookingSession */
    private final Map<UUID, BookingSession> sessions = new ConcurrentHashMap<>();

    // ================================================================
    // PUBLIC API
    // ================================================================

    /**
     * Bắt đầu luồng đặt lịch.
     * Requirements: 4.1, 4.2
     */
    public String startBooking(String doctorName, UUID userId, String originalMessage) {
        // 4.1 — Unauthenticated
        if (userId == null) {
            return "🔐 **VUI LÒNG ĐĂNG NHẬP**\n\n" +
                    "Để đặt lịch khám, bạn cần đăng nhập vào hệ thống.\n\n" +
                    "• Đã có tài khoản: Đăng nhập tại website\n" +
                    "• Chưa có tài khoản: Đăng ký miễn phí tại mục Đăng ký\n\n" +
                    "Sau khi đăng nhập, tôi sẽ hỗ trợ bạn đặt lịch!";
        }

        Optional<Patient> patientOpt = patientRepository.findByUserId(userId);
        if (patientOpt.isEmpty()) {
            return "❌ Không tìm thấy thông tin bệnh nhân.\n\n" +
                    "Vui lòng cập nhật hồ sơ y tế trước khi đặt lịch.";
        }

        Patient patient = patientOpt.get();

        // Tạo session mới
        BookingSession session = new BookingSession();
        session.originalMessage = originalMessage;
        session.patientId = patient.getId();
        session.step = "WAITING_DATE";
        session.createdAt = LocalDateTime.now();
        sessions.put(userId, session);

        if (doctorName == null || doctorName.trim().isEmpty()) {
            return "🩺 **ĐẶT LỊCH KHÁM**\n\n" +
                    "Bạn muốn đặt lịch với bác sĩ nào?\n\n" +
                    "👉 Hãy cho tôi biết tên bác sĩ, ví dụ:\n" +
                    "   \"Đặt lịch với bác sĩ Nguyễn Văn A\"\n\n" +
                    "💡 Bạn có thể nói \"Gợi ý bác sĩ\" để xem danh sách.";
        }

        List<Doctor> doctors = doctorRepository.findByFullNameContainingIgnoreCase(doctorName);
        Doctor doctor = (doctors != null && !doctors.isEmpty()) ? doctors.get(0) : null;

        if (doctor == null) {
            return "❌ Không tìm thấy bác sĩ \"" + doctorName + "\".\n\n" +
                    "💡 Vui lòng kiểm tra lại tên hoặc nói \"Gợi ý bác sĩ\" để xem danh sách.\n\n" +
                    "Bạn cũng có thể nói \"Đặt lịch với bác sĩ [tên khác]\"";
        }

        session.doctorId = doctor.getId();
        session.doctorName = doctor.getFullName();

        return "🩺 **ĐẶT LỊCH VỚI BÁC SĨ " + doctor.getFullName().toUpperCase() + "**\n\n" +
                "Vui lòng cung cấp thông tin:\n\n" +
                "1️⃣ **Ngày khám** (ví dụ: ngày 15/06/2024, mai, thứ 2)\n" +
                "2️⃣ **Giờ khám** (ví dụ: lúc 9h30, 14h chiều)\n" +
                "3️⃣ **Lý do khám** (không bắt buộc)\n\n" +
                "📌 **Ví dụ:** \"Ngày 15/6 lúc 9h khám đau đầu\"\n\n" +
                "⏰ **Lưu ý:** Bác sĩ làm việc từ 8h-12h sáng và 14h-17h chiều, từ thứ 2 đến thứ 7.\n\n" +
                "👉 Hãy nhập thông tin theo mẫu trên nhé!";
    }

    /**
     * Xác nhận đặt lịch từ thông tin người dùng cung cấp.
     * Requirements: 4.3, 4.4, 4.5, 4.6, 7.4
     */
    public String confirmBooking(UUID userId, String userMessage) {
        BookingSession session = sessions.get(userId);

        // 7.4 — Session hết hạn hoặc không tồn tại
        if (session == null || isExpired(session)) {
            sessions.remove(userId);
            return "⏰ **PHIÊN ĐẶT LỊCH ĐÃ HẾT HẠN**\n\n" +
                    "Phiên đặt lịch của bạn đã hết hạn (30 phút).\n\n" +
                    "Vui lòng bắt đầu lại bằng cách nói: \"Tôi muốn đặt lịch khám\"";
        }

        LocalDate date = extractDate(userMessage);
        LocalTime time = extractTime(userMessage);
        String reason = extractReason(userMessage);

        if (date == null) {
            return "📅 **THIẾU NGÀY KHÁM**\n\n" +
                    "Tôi chưa rõ **ngày khám**. Vui lòng nhập rõ hơn:\n\n" +
                    "• Ngày cụ thể: \"ngày 15/06\" hoặc \"15 tháng 6\"\n" +
                    "• Ngày trong tuần: \"thứ 2 tuần sau\"\n" +
                    "• Ngày mai/hôm kia: \"mai\" hoặc \"ngày mai\"\n\n" +
                    "Ví dụ: \"ngày 20/06/2024\"";
        }

        if (time == null) {
            return "⏰ **THIẾU GIỜ KHÁM**\n\n" +
                    "Tôi chưa rõ **giờ khám**. Vui lòng cho biết giờ cụ thể:\n\n" +
                    "• \"lúc 9h30\", \"9 giờ sáng\"\n" +
                    "• \"14h chiều\", \"2 giờ chiều\"\n\n" +
                    "⏰ Lưu ý: Giờ khám trong khung 8h-12h hoặc 14h-17h";
        }

        // 4.6 — Kiểm tra giờ làm việc
        if (isOutsideWorkingHours(time)) {
            return "⏰ **GIỜ KHÁM KHÔNG HỢP LỆ**\n\n" +
                    "Bác sĩ chỉ làm việc trong khung giờ:\n" +
                    "• **Sáng:** 8:00 - 12:00\n" +
                    "• **Chiều:** 14:00 - 17:00\n\n" +
                    "Vui lòng chọn lại giờ khám phù hợp.\n\n" +
                    "Ví dụ: \"lúc 9h sáng\" hoặc \"14h30 chiều\"";
        }

        Doctor doctor = doctorRepository.findById(session.doctorId).orElse(null);
        if (doctor == null) {
            sessions.remove(userId);
            return "❌ Bác sĩ không tồn tại. Vui lòng đặt lịch lại.\n\n" +
                    "Nói \"Gợi ý bác sĩ\" để xem danh sách bác sĩ.";
        }

        try {
            AppointmentRequest request = AppointmentRequest.builder()
                    .appointmentDate(date)
                    .startTime(time)
                    .reason(reason != null ? reason : session.originalMessage)
                    .appointmentType("FIRST_VISIT")
                    .build();

            AppointmentResponse appointment = appointmentService.createAppointment(
                    session.patientId, doctor.getId(), request);

            PaymentResponseDTO payment = paymentService.createAppointmentPayment(appointment.getId());

            // 4.4 — Xóa session sau khi đặt thành công
            sessions.remove(userId);

            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

            return String.format(
                    "✅ **ĐẶT LỊCH THÀNH CÔNG!**\n\n" +
                            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                            "📋 **Mã lịch hẹn:** %d\n" +
                            "👨‍⚕️ **Bác sĩ:** %s\n" +
                            "🏥 **Chuyên khoa:** %s\n" +
                            "📅 **Ngày khám:** %s\n" +
                            "⏰ **Giờ:** %s - %s\n" +
                            "💰 **Phí khám:** %,d VNĐ\n" +
                            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                            "🔗 **THANH TOÁN NGAY:**\n%s\n\n" +
                            "💡 **Hướng dẫn:**\n" +
                            "1. Nhấn vào link thanh toán bên trên\n" +
                            "2. Hoàn tất thanh toán qua PayOS\n" +
                            "3. Sau khi thanh toán, lịch hẹn sẽ được xác nhận\n" +
                            "4. Bạn sẽ nhận được tin nhắn xác nhận qua email/SMS\n\n" +
                            "🌡️ **Lưu ý trước khi khám:**\n" +
                            "• Nhịn ăn 8 tiếng nếu cần xét nghiệm máu\n" +
                            "• Mang theo thuốc đang dùng (nếu có)\n" +
                            "• Đến trước 15 phút để làm thủ tục\n\n" +
                            "🌟 Cảm ơn bạn đã tin tưởng Bệnh viện Kim Quy!",
                    appointment.getId(),
                    doctor.getFullName(),
                    doctor.getSpecialty() != null ? doctor.getSpecialty().getName() : "Tổng quát",
                    date.format(dateFormatter),
                    time.format(timeFormatter),
                    appointment.getEndTime().format(timeFormatter),
                    doctor.getClinicFee() != null ? doctor.getClinicFee().longValue() : 0L,
                    payment.getCheckoutUrl()
            );

        } catch (AppException e) {
            // 4.5 — Conflict: gợi ý khung giờ khác
            if (e.getErrorCode() == ErrorCode.APPOINTMENT_CONFLICT) {
                String suggestions = buildAlternativeSlots(doctor.getId(), date);
                return "❌ **LỊCH ĐÃ BỊ TRÙNG**\n\n" +
                        "Khung giờ bạn chọn đã có người đặt hoặc bác sĩ bận.\n\n" +
                        suggestions +
                        "👉 Nói \"Xem lịch bác sĩ " + doctor.getFullName() + "\" để xem lịch rảnh.";
            }
            if (e.getErrorCode() == ErrorCode.SCHEDULE_FULL) {
                return "❌ **LỊCH ĐÃ ĐẦY**\n\n" +
                        "Ngày này bác sĩ đã hết lịch tiếp nhận bệnh nhân.\n\n" +
                        "👉 Nói \"Xem lịch bác sĩ " + doctor.getFullName() + "\" để xem ngày rảnh khác.";
            }
            return "❌ **Không thể đặt lịch:** " + e.getMessage() + "\n\n" +
                    "💡 Vui lòng thử lại hoặc gọi tổng đài **1900 1234** để được hỗ trợ.";
        } catch (Exception e) {
            log.error("Booking error for userId={}", userId, e);
            return "❌ Đã có lỗi xảy ra khi đặt lịch.\n\n" +
                    "💡 Vui lòng thử lại sau hoặc gọi hotline **1900 1234** để được hỗ trợ trực tiếp.";
        }
    }

    /**
     * Hủy phiên đặt lịch đang chờ.
     */
    public String cancelBooking(UUID userId) {
        BookingSession session = sessions.remove(userId);
        if (session != null) {
            return "✗ **Đã hủy yêu cầu đặt lịch**\n\n" +
                    "Bạn đã hủy yêu cầu đặt lịch đang chờ xử lý.\n\n" +
                    "💡 Nếu cần đặt lịch sau, hãy nói: \"Tôi muốn đặt lịch khám\" nhé!";
        }
        return "ℹ️ Hiện tại bạn không có yêu cầu đặt lịch nào đang chờ xử lý.\n\n" +
                "💡 Để đặt lịch mới, hãy nói: \"Đặt lịch khám\"";
    }

    /**
     * Kiểm tra xem người dùng có phiên đặt lịch đang hoạt động không.
     * Requirements: 7.4
     */
    public boolean hasActiveSession(UUID userId) {
        if (userId == null) return false;
        BookingSession session = sessions.get(userId);
        if (session == null) return false;
        if (isExpired(session)) {
            sessions.remove(userId);
            return false;
        }
        return true;
    }

    // ================================================================
    // TTL CLEANUP — chạy mỗi 60 giây, xóa session > 30 phút
    // ================================================================

    @Scheduled(fixedDelay = 60_000)
    public void cleanupExpiredSessions() {
        int removed = 0;
        for (Map.Entry<UUID, BookingSession> entry : sessions.entrySet()) {
            if (isExpired(entry.getValue())) {
                sessions.remove(entry.getKey());
                removed++;
            }
        }
        if (removed > 0) {
            log.debug("BookingFlowService: removed {} expired session(s)", removed);
        }
    }

    // ================================================================
    // PRIVATE HELPERS
    // ================================================================

    private boolean isExpired(BookingSession session) {
        return session.createdAt != null &&
                session.createdAt.isBefore(LocalDateTime.now().minusMinutes(30));
    }

    /**
     * 4.6 — Giờ ngoài khung làm việc: trước 8h, 12h-14h, sau 17h
     */
    private boolean isOutsideWorkingHours(LocalTime time) {
        return time.isBefore(LocalTime.of(8, 0))
                || (time.isAfter(LocalTime.of(12, 0)) && time.isBefore(LocalTime.of(14, 0)))
                || time.isAfter(LocalTime.of(17, 0));
    }

    /**
     * 4.5 — Gợi ý khung giờ khác khi bị conflict.
     */
    private String buildAlternativeSlots(UUID doctorId, LocalDate date) {
        try {
            List<Schedule> schedules = scheduleRepository.findByDoctorIdAndWorkDate(doctorId, date);
            if (schedules == null || schedules.isEmpty()) {
                return "💡 Vui lòng thử:\n• Ngày khác\n• Giờ khác\n• Bác sĩ khác\n\n";
            }

            Schedule schedule = schedules.get(0);
            int bookedCount = appointmentRepository.countBookedAppointments(schedule.getId());
            if (bookedCount >= schedule.getMaxPatient()) {
                return "💡 Lịch ngày này đã đầy. Vui lòng chọn ngày khác.\n\n";
            }

            // Gợi ý các slot 30 phút trong khung giờ làm việc của schedule
            List<String> suggestions = new ArrayList<>();
            LocalTime cursor = schedule.getStartTime();
            LocalTime end = schedule.getEndTime();
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("HH:mm");

            while (!cursor.plusMinutes(30).isAfter(end) && suggestions.size() < 3) {
                if (!isOutsideWorkingHours(cursor)) {
                    LocalTime slotEnd = cursor.plusMinutes(30);
                    boolean conflict = appointmentRepository.existsDoctorTimeConflict(
                            doctorId, date, cursor, slotEnd);
                    if (!conflict) {
                        suggestions.add("• " + cursor.format(fmt));
                    }
                }
                cursor = cursor.plusMinutes(30);
            }

            if (suggestions.isEmpty()) {
                return "💡 Không còn khung giờ trống trong ngày này. Vui lòng chọn ngày khác.\n\n";
            }

            return "💡 **Khung giờ còn trống trong ngày:**\n" +
                    String.join("\n", suggestions) + "\n\n";

        } catch (Exception e) {
            log.warn("Could not build alternative slots for doctorId={}, date={}", doctorId, date, e);
            return "💡 Vui lòng thử:\n• Ngày khác\n• Giờ khác\n\n";
        }
    }

    // ================================================================
    // DATE / TIME / REASON EXTRACTION (ported from ChatService)
    // ================================================================

    LocalDate extractDate(String text) {
        String lower = text.toLowerCase();

        if (lower.contains("ngày mai")) return LocalDate.now().plusDays(1);
        if (lower.contains("mai") && !lower.contains("không mai")) return LocalDate.now().plusDays(1);
        if (lower.contains("hôm kia")) return LocalDate.now().plusDays(2);
        if (lower.contains("hôm nay") || lower.contains("today")) return LocalDate.now();

        // Thứ trong tuần
        Map<String, Integer> dayMap = new LinkedHashMap<>();
        dayMap.put("thứ 2", 1); dayMap.put("thứ hai", 1);
        dayMap.put("thứ 3", 2); dayMap.put("thứ ba", 2);
        dayMap.put("thứ 4", 3); dayMap.put("thứ tư", 3);
        dayMap.put("thứ 5", 4); dayMap.put("thứ năm", 4);
        dayMap.put("thứ 6", 5); dayMap.put("thứ sáu", 5);
        dayMap.put("thứ 7", 6); dayMap.put("thứ bảy", 6);
        dayMap.put("chủ nhật", 7);

        for (Map.Entry<String, Integer> entry : dayMap.entrySet()) {
            if (lower.contains(entry.getKey())) {
                LocalDate today = LocalDate.now();
                int current = today.getDayOfWeek().getValue();
                int target = entry.getValue();
                int daysToAdd = target - current;
                if (daysToAdd <= 0) daysToAdd += 7;
                if (lower.contains("sau") || lower.contains("tới")) daysToAdd += 7;
                return today.plusDays(daysToAdd);
            }
        }

        // dd/MM hoặc dd/MM/yyyy
        Pattern datePattern = Pattern.compile("(\\d{1,2})[/\\-](\\d{1,2})(?:[/\\-](\\d{2,4}))?");
        Matcher matcher = datePattern.matcher(text);
        if (matcher.find()) {
            int day = Integer.parseInt(matcher.group(1));
            int month = Integer.parseInt(matcher.group(2));
            int year = matcher.group(3) != null ? Integer.parseInt(matcher.group(3)) : LocalDate.now().getYear();
            if (year < 100) year += 2000;
            try {
                LocalDate date = LocalDate.of(year, month, day);
                if (date.isBefore(LocalDate.now())) date = date.plusYears(1);
                return date;
            } catch (Exception e) {
                log.warn("Invalid date parsed: {}-{}-{}", year, month, day);
            }
        }

        return null;
    }

    LocalTime extractTime(String text) {
        String lower = text.toLowerCase();
        Pattern timePattern = Pattern.compile("(\\d{1,2})[:h\\.]?(\\d{0,2})\\s*(?:giờ|h)?");
        Matcher matcher = timePattern.matcher(lower);

        if (matcher.find()) {
            int hour = Integer.parseInt(matcher.group(1));
            int minute = (matcher.group(2) != null && !matcher.group(2).isEmpty())
                    ? Integer.parseInt(matcher.group(2)) : 0;

            if (lower.contains("chiều") || lower.contains("tối")) {
                if (hour < 12) hour += 12;
            } else if (lower.contains("sáng") && hour == 12) {
                hour = 0;
            }

            if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
                return LocalTime.of(hour, minute);
            }
        }
        return null;
    }

    private String extractReason(String text) {
        List<String> patterns = List.of(
                "khám vì\\s+(.+?)(?:\\.|$|\\n|và|với)",
                "lý do:\\s*(.+?)(?:\\.|$|\\n)",
                "bị\\s+(.+?)(?:\\.|$|\\n|và)"
        );
        for (String patternStr : patterns) {
            Matcher matcher = Pattern.compile(patternStr, Pattern.CASE_INSENSITIVE).matcher(text);
            if (matcher.find()) {
                String reason = matcher.group(1).trim();
                if (reason.length() > 5 && reason.length() < 200) return reason;
            }
        }
        return null;
    }

    // ================================================================
    // INNER CLASS
    // ================================================================

    /**
     * BookingSession — lưu trạng thái đặt lịch tạm thời của người dùng.
     */
    public static class BookingSession {
        public UUID doctorId;
        public String doctorName;
        public UUID patientId;
        public String originalMessage;
        /** WAITING_DATE | WAITING_TIME | READY */
        public String step;
        public LocalDateTime createdAt;
    }
}
