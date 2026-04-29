package nhb.vn.be.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nhb.vn.be.dto.request.ChatRequest;
import nhb.vn.be.entity.Appointment;
import nhb.vn.be.entity.Doctor;
import nhb.vn.be.entity.MedicalService;
import nhb.vn.be.entity.Patient;
import nhb.vn.be.entity.Schedule;
import nhb.vn.be.entity.Specialty;
import nhb.vn.be.repository.AppointmentRepository;
import nhb.vn.be.repository.DoctorRepository;
import nhb.vn.be.repository.MedicalServiceRepository;
import nhb.vn.be.repository.PatientRepository;
import nhb.vn.be.repository.ScheduleRepository;
import nhb.vn.be.repository.SpecialtyRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
import org.springframework.ai.chat.memory.repository.jdbc.JdbcChatMemoryRepository;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.ChatOptions;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.content.Media;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.util.MimeTypeUtils;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.LongAdder;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatClient.Builder chatClientBuilder;
    private final JdbcChatMemoryRepository jdbcChatMemoryRepository;
    private final DoctorRepository doctorRepository;
    private final SpecialtyRepository specialtyRepository;
    private final ScheduleRepository scheduleRepository;
    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final MedicalServiceRepository medicalServiceRepository;

    // Injected collaborators
    private final IntentClassifier intentClassifier;
    private final BookingFlowService bookingFlowService;
    private final DoctorSuggestionHelper doctorSuggestionHelper;

    private ChatClient chatClient;

    // Quality metrics (kept from original)
    private final LongAdder totalChatRequests = new LongAdder();
    private final LongAdder totalChatFallbacks = new LongAdder();
    private final Map<String, LongAdder> failedQuestionCounter = new ConcurrentHashMap<>();

    // ================================================================
    // ChatClient initialisation
    // ================================================================

    private ChatClient getChatClient() {
        if (chatClient == null) {
            ChatMemory chatMemory = MessageWindowChatMemory.builder()
                    .maxMessages(30)
                    .chatMemoryRepository(jdbcChatMemoryRepository)
                    .build();

            chatClient = chatClientBuilder
                    .defaultAdvisors(MessageChatMemoryAdvisor.builder(chatMemory).build())
                    .build();
        }
        return chatClient;
    }

    // ================================================================
    // PUBLIC API
    // ================================================================

    /**
     * Main chat entry-point (orchestrator).
     * Signature kept identical to original so the controller needs no changes.
     */
    public String chat(String message, UUID userId, String conversationId) {
        totalChatRequests.increment();

        // ── Empty / whitespace guard (Requirement 7.3) ──────────────────────
        if (message == null || message.isBlank()) {
            return "Bạn có thể mô tả vấn đề sức khỏe, hỏi thông tin bệnh viện, hoặc yêu cầu đặt lịch khám. "
                    + "Ví dụ: \"Tôi bị đau họng 2 ngày nay\".";
        }

        log.info("Chat request - userId: {}, message: {}", userId, message);

        String finalConversationId = conversationId != null ? conversationId
                : (userId != null ? "user_" + userId : "anon_" + System.currentTimeMillis());

        // ── Intent classification ────────────────────────────────────────────
        boolean hasActiveBooking = userId != null && bookingFlowService.hasActiveSession(userId);
        IntentResult intent = intentClassifier.classify(message, hasActiveBooking);
        log.info("Classified intent: {}", intent.intent());

        // ── Dispatch ─────────────────────────────────────────────────────────
        try {
            return switch (intent.intent()) {
                case "SUGGEST_DOCTOR"    -> doctorSuggestionHelper.handleSuggestDoctor(message);
                case "CHECK_SCHEDULE"   -> handleCheckSchedule(intent.extractedEntity());
                case "BOOKING"          -> bookingFlowService.startBooking(intent.extractedEntity(), userId, message);
                case "CONFIRM_BOOKING"  -> bookingFlowService.confirmBooking(userId, message);
                case "CANCEL_BOOKING"   -> bookingFlowService.cancelBooking(userId);
                case "VIEW_APPOINTMENTS" -> handleViewAppointments(userId);
                case "HOSPITAL_INFO"    -> handleHospitalInfo(message);
                default                 -> callMedicalAI(message, userId, finalConversationId);
            };
        } catch (Exception e) {
            log.error("Error processing chat", e);
            return "Xin lỗi, tôi gặp lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.\n\n"
                    + "Hoặc gọi hotline **1900 1234** để được hỗ trợ trực tiếp.";
        }
    }

    /** Convenience overload used by ChatController. */
    public String chat(ChatRequest request) {
        return chat(request.message(), request.userId(), request.conversationId());
    }

    // ================================================================
    // CHAT WITH IMAGE (unchanged)
    // ================================================================

    public String chatWithImage(MultipartFile file, String message, UUID userId, String conversationId) {
        log.info("Chat with image - userId: {}, message: {}, fileName: {}", userId, message, file.getOriginalFilename());

        String finalConversationId = conversationId != null ? conversationId
                : (userId != null ? "user_" + userId : "anon_" + System.currentTimeMillis());

        try {
            Media media = Media.builder()
                    .mimeType(MimeTypeUtils.parseMimeType(file.getContentType()))
                    .data(file.getResource())
                    .build();

            ChatOptions chatOptions = ChatOptions.builder().temperature(0.3D).build();

            String aiResponse = getChatClient().prompt()
                    .options(chatOptions)
                    .advisors(advisorSpec -> advisorSpec
                            .param(ChatMemory.CONVERSATION_ID, finalConversationId))
                    .system("""
                            Bạn là AI y tế KimQuy, chuyên phân tích hình ảnh y tế.
                            
                            QUY TẮC:
                            1. Mô tả những gì bạn thấy trong ảnh một cách khách quan
                            2. Nếu là ảnh đơn thuốc -> đọc và giải thích công dụng cơ bản
                            3. Nếu là ảnh vết thương/triệu chứng -> đưa lời khuyên sơ cứu, LUÔN khuyên đi khám bác sĩ
                            4. Nếu là ảnh kết quả xét nghiệm -> giải thích chỉ số cơ bản, khuyên tham khảo bác sĩ
                            5. KHÔNG BAO GIỜ chẩn đoán bệnh qua ảnh
                            6. Giọng điệu ân cần, chuyên nghiệp nhưng dễ hiểu
                            """)
                    .user(userSpec -> userSpec
                            .media(media)
                            .text(message != null && !message.isEmpty() ? message : "Vui lòng phân tích hình ảnh này cho tôi"))
                    .call()
                    .content();

            return aiResponse;

        } catch (Exception e) {
            log.error("Error processing image chat", e);
            return "Xin lỗi, tôi không thể xử lý hình ảnh này. Vui lòng thử lại với hình ảnh rõ nét hơn.\n\n"
                    + "📌 Lưu ý: Hình ảnh nên rõ ràng, đủ ánh sáng và đúng góc chụp.";
        }
    }

    public String chatWithImage(MultipartFile file, String message) {
        return chatWithImage(file, message, null, null);
    }

    // ================================================================
    // STUB HANDLERS (to be fully implemented in Tasks 5 & 6)
    // ================================================================

    /**
     * Full implementation — Task 5.
     * Requirements: 3.1, 3.2, 3.3, 3.4
     */
    private String handleCheckSchedule(String doctorName) {
        if (doctorName == null || doctorName.isBlank()) {
            return "🔍 Bạn muốn xem lịch của bác sĩ nào?\n\n"
                    + "Vui lòng cho tôi tên cụ thể, ví dụ:\n"
                    + "• \"Xem lịch bác sĩ Nguyễn Văn A\"\n"
                    + "• \"Lịch rảnh của bác sĩ Trần Thị B\"";
        }

        // 1. Find doctor by name (case-insensitive, partial match) — Requirement 3.4
        List<Doctor> matched = doctorRepository.findByFullNameContainingIgnoreCase(doctorName.trim());
        if (matched.isEmpty()) {
            return "❌ Không tìm thấy bác sĩ **\"" + doctorName + "\"** trong hệ thống.\n\n"
                    + "💡 Bạn có thể:\n"
                    + "• Kiểm tra lại tên bác sĩ\n"
                    + "• Gõ \"Gợi ý bác sĩ\" để xem danh sách bác sĩ hiện có";
        }

        Doctor doctor = matched.get(0);
        LocalDate today = LocalDate.now();
        LocalDate sevenDaysLater = today.plusDays(7);

        // 2. Query schedules from today onwards — Requirement 3.1
        List<Schedule> upcomingSchedules = scheduleRepository.findUpcomingSchedulesByDoctorId(doctor.getId(), today);

        // 3. Filter: only keep slots where bookedCount < maxPatient — Requirement 3.2
        List<Schedule> availableSchedules = upcomingSchedules.stream()
                .filter(s -> {
                    int booked = appointmentRepository.countBookedAppointments(s.getId());
                    return booked < s.getMaxPatient();
                })
                .limit(5)
                .toList();

        // 4. Check if no available schedules in 7 days — Requirement 3.3
        boolean hasAvailableInSevenDays = availableSchedules.stream()
                .anyMatch(s -> !s.getWorkDate().isAfter(sevenDaysLater));

        if (availableSchedules.isEmpty() || !hasAvailableInSevenDays) {
            String specialtyName = doctor.getSpecialty() != null ? doctor.getSpecialty().getName() : null;
            StringBuilder sb = new StringBuilder();
            sb.append("😔 **Bác sĩ ").append(doctor.getFullName())
              .append("** hiện không có lịch rảnh trong 7 ngày tới.\n\n");

            if (specialtyName != null) {
                List<Doctor> otherDoctors = doctorSuggestionHelper.suggestDoctorsBySpecialty(specialtyName)
                        .stream()
                        .filter(d -> !d.getId().equals(doctor.getId()))
                        .limit(3)
                        .toList();

                if (!otherDoctors.isEmpty()) {
                    sb.append("👨‍⚕️ **Bác sĩ cùng chuyên khoa ").append(specialtyName).append(" còn lịch:**\n\n");
                    sb.append(doctorSuggestionHelper.buildDoctorListMarkdown(otherDoctors));
                } else {
                    sb.append("💡 Vui lòng gọi hotline **1900 1234** để được hỗ trợ đặt lịch.");
                }
            } else {
                sb.append("💡 Vui lòng gọi hotline **1900 1234** để được hỗ trợ đặt lịch.");
            }
            return sb.toString();
        }

        // 5. Format output as Markdown — Requirement 3.2
        DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        DateTimeFormatter timeFmt = DateTimeFormatter.ofPattern("HH:mm");

        StringBuilder sb = new StringBuilder();
        sb.append("📅 **LỊCH RẢNH CỦA BÁC SĨ ").append(doctor.getFullName().toUpperCase()).append("**\n\n");

        for (Schedule s : availableSchedules) {
            int booked = appointmentRepository.countBookedAppointments(s.getId());
            int available = s.getMaxPatient() - booked;
            sb.append("🗓️ **").append(s.getWorkDate().format(dateFmt)).append("**")
              .append(" | ⏰ ").append(s.getStartTime().format(timeFmt))
              .append(" - ").append(s.getEndTime().format(timeFmt))
              .append(" | 🪑 Còn **").append(available).append("** chỗ trống\n");
        }

        sb.append("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n");
        sb.append("👉 Để đặt lịch, nói: \"Đặt lịch với bác sĩ ").append(doctor.getFullName()).append("\"");
        return sb.toString();
    }

    /**
     * Requirement 5.1–5.4: View upcoming appointments for the authenticated patient.
     */
    private String handleViewAppointments(UUID userId) {
        // Requirement 5.4: unauthenticated → ask to log in
        if (userId == null) {
            return "🔐 Vui lòng **đăng nhập** để xem lịch hẹn của bạn.";
        }

        // Find patient profile linked to this user account
        Patient patient = patientRepository.findByUserId(userId).orElse(null);
        if (patient == null) {
            return "⚠️ Không tìm thấy hồ sơ bệnh nhân cho tài khoản của bạn. "
                    + "Vui lòng liên hệ hotline **1900 1234** để được hỗ trợ.";
        }

        // Requirement 5.1: query upcoming appointments (PENDING/CONFIRMED, date >= today)
        List<Appointment> appointments = appointmentRepository.findUpcomingAppointmentsByPatient(patient.getId());

        // Requirement 5.3: no appointments → notify + suggest booking
        if (appointments.isEmpty()) {
            return "📋 Bạn chưa có lịch hẹn nào sắp tới.\n\n"
                    + "👉 Để đặt lịch khám mới, bạn có thể nói: "
                    + "\"Đặt lịch với bác sĩ [tên bác sĩ]\" hoặc \"Gợi ý bác sĩ\" để xem danh sách bác sĩ phù hợp.";
        }

        // Requirement 5.2: format as Markdown with appointment ID, doctor name, date/time, status
        DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        DateTimeFormatter timeFmt = DateTimeFormatter.ofPattern("HH:mm");

        StringBuilder sb = new StringBuilder();
        sb.append("📋 **LỊCH HẸN SẮP TỚI CỦA BẠN**\n\n");

        for (Appointment appt : appointments) {
            String doctorName = appt.getDoctor() != null ? appt.getDoctor().getFullName() : "N/A";
            String date = appt.getAppointmentDate() != null ? appt.getAppointmentDate().format(dateFmt) : "N/A";
            String startTime = appt.getStartTime() != null ? appt.getStartTime().format(timeFmt) : "N/A";
            String endTime = appt.getEndTime() != null ? appt.getEndTime().format(timeFmt) : "";
            String timeRange = endTime.isEmpty() ? startTime : startTime + " - " + endTime;
            String status = formatAppointmentStatus(appt.getStatus());

            sb.append("---\n");
            sb.append("🆔 **Mã lịch hẹn:** #").append(appt.getId()).append("\n");
            sb.append("👨‍⚕️ **Bác sĩ:** ").append(doctorName).append("\n");
            sb.append("📅 **Ngày:** ").append(date).append("\n");
            sb.append("⏰ **Giờ:** ").append(timeRange).append("\n");
            sb.append("📌 **Trạng thái:** ").append(status).append("\n\n");
        }

        sb.append("💡 Để đặt thêm lịch hẹn mới, nói: \"Đặt lịch với bác sĩ [tên bác sĩ]\".");
        return sb.toString();
    }

    private String formatAppointmentStatus(String status) {
        if (status == null) return "N/A";
        return switch (status.toUpperCase()) {
            case "PENDING"   -> "⏳ Chờ xác nhận";
            case "CONFIRMED" -> "✅ Đã xác nhận";
            case "COMPLETED" -> "🏁 Đã hoàn thành";
            case "CANCELLED" -> "❌ Đã hủy";
            default          -> status;
        };
    }

    // ================================================================
    // HOSPITAL INFO HANDLER
    // ================================================================

    private String handleHospitalInfo(String message) {
        String lower = message.toLowerCase();

        if (lower.contains("địa chỉ") || lower.contains("ở đâu")) {
            return "🏥 **ĐỊA CHỈ BỆNH VIỆN KIM QUY**\n\n"
                    + "📍 Số 123 Đường Lê Lợi, Phường Bến Thành\n"
                    + "   Quận 1, Thành phố Hồ Chí Minh\n\n"
                    + "🗺️ Xem bản đồ: [Link Google Maps]\n\n"
                    + "🚗 **Phương tiện di chuyển:**\n"
                    + "• Xe bus: Các tuyến 01, 02, 03, 04, 05\n"
                    + "• Xe máy: Có bãi giữ xe rộng rãi\n"
                    + "• Taxi/Xe công nghệ: Gọi đến địa chỉ trên";
        }

        if (lower.contains("giờ") || lower.contains("thời gian") || lower.contains("làm việc")) {
            return "⏰ **GIỜ LÀM VIỆC**\n\n"
                    + "📅 **Thứ 2 - Thứ 7:**\n"
                    + "   • Sáng: 7:30 - 12:00\n"
                    + "   • Chiều: 13:30 - 17:00\n\n"
                    + "📅 **Chủ nhật:**\n"
                    + "   • Chỉ cấp cứu 24/7, không khám bảo hiểm\n\n"
                    + "🩺 **Cấp cứu 24/7:**\n"
                    + "   • Hotline: **1900 1234**\n"
                    + "   • Luôn sẵn sàng phục vụ bạn!";
        }

        if (lower.contains("hotline") || lower.contains("số điện thoại") || lower.contains("liên hệ")) {
            return "📞 **HOTLINE BỆNH VIỆN KIM QUY**\n\n"
                    + "🩺 **Cấp cứu 24/7:** **1900 1234**\n"
                    + "📋 **Đặt lịch hẹn:** **1900 5678**\n"
                    + "💬 **Tư vấn sức khỏe:** **1900 9999**\n"
                    + "📧 **Email:** info@kimquyhospital.vn\n\n"
                    + "🌐 **Website:** www.kimquyhospital.vn\n\n"
                    + "💡 Bạn cũng có thể chat với tôi để được tư vấn miễn phí!";
        }

        if (lower.contains("phí") || lower.contains("giá") || lower.contains("chi phí")) {
            return "💰 **BẢNG GIÁ DỊCH VỤ**\n\n"
                    + "👨‍⚕️ **Phí khám bác sĩ:**\n"
                    + "   • Bác sĩ chuyên khoa: 200,000 - 300,000 VNĐ\n"
                    + "   • Phó giáo sư, Tiến sĩ: 300,000 - 500,000 VNĐ\n"
                    + "   • Giáo sư đầu ngành: 500,000 - 800,000 VNĐ\n\n"
                    + "🩻 **Xét nghiệm cơ bản:**\n"
                    + "   • Xét nghiệm máu: 100,000 - 200,000 VNĐ\n"
                    + "   • X-quang: 150,000 VNĐ\n"
                    + "   • Siêu âm: 200,000 - 300,000 VNĐ\n\n"
                    + "💳 **Thanh toán:**\n"
                    + "   • Tiền mặt, chuyển khoản, ví điện tử\n"
                    + "   • Bảo hiểm y tế (theo quy định)\n\n"
                    + "👉 Để biết chi phí cụ thể, vui lòng liên hệ hotline hoặc chat với tôi!";
        }

        return "🏥 **BỆNH VIỆN KIM QUY**\n\n"
                + "📍 **Địa chỉ:** 123 Đường Lê Lợi, Quận 1, TP.HCM\n"
                + "⏰ **Giờ làm việc:** Thứ 2 - Thứ 7 (7:30 - 17:00)\n"
                + "🩺 **Cấp cứu 24/7:** 1900 1234\n"
                + "📞 **Hotline:** 1900 5678\n\n"
                + "💡 **Bạn muốn biết thêm về:**\n"
                + "• Địa chỉ chi tiết\n"
                + "• Giờ làm việc cụ thể\n"
                + "• Hotline liên hệ\n"
                + "• Bảng giá dịch vụ\n\n"
                + "👉 Hãy hỏi tôi để được giải đáp cụ thể!";
    }

    // ================================================================
    // AI CALL WITH RETRY + DB-ENRICHED SYSTEM PROMPT
    // ================================================================

    /**
     * Calls the AI model with a system prompt enriched by live DB data
     * (specialty list + top 3 doctors).  Retries once on failure (Requirement 7.1).
     */
    private String callMedicalAI(String message, UUID userId, String conversationId) {
        String systemPrompt = buildSystemPrompt();

        for (int attempt = 0; attempt < 2; attempt++) {
            try {
                SystemMessage systemMessage = new SystemMessage(systemPrompt);
                UserMessage userMessage = new UserMessage(message);
                Prompt prompt = new Prompt(systemMessage, userMessage);

                String content = getChatClient()
                        .prompt(prompt)
                        .options(ChatOptions.builder().temperature(0.2D).build())
                        .advisors(advisorSpec -> advisorSpec.param(ChatMemory.CONVERSATION_ID, conversationId))
                        .call()
                        .content();

                if (content != null && !content.isBlank()) {
                    return content;
                }
            } catch (Exception e) {
                log.error("AI call failed - attempt {}", attempt + 1, e);
            }
        }

        // Both attempts failed — friendly fallback (Requirement 7.1)
        recordFallbackQuestion(message);
        return "Xin lỗi, tôi đang gặp sự cố kết nối với hệ thống AI.\n\n"
                + "💡 Bạn vẫn có thể:\n"
                + "• Hỏi tôi về lịch khám, đặt lịch, thông tin bệnh viện\n"
                + "• Gọi hotline **1900 1234** để được tư vấn trực tiếp\n"
                + "• Đến trực tiếp bệnh viện để được hỗ trợ\n\n"
                + "Rất xin lỗi vì sự bất tiện này!";
    }

    /**
     * Builds the system prompt injected with live DB data:
     * - list of specialties
     * - top 5 doctors by rating
     * - medical services available
     */
    private String buildSystemPrompt() {
        StringBuilder sb = new StringBuilder();
        sb.append("""
                Bạn là trợ lý AI y tế chuyên nghiệp của Bệnh viện Kim Quy.
                Tên của bạn là KimQuy AI.

                === QUY TẮC BẮT BUỘC ===
                1. Luôn trả lời bằng tiếng Việt, giọng điệu thân thiện, chuyên nghiệp và đồng cảm.
                2. TUYỆT ĐỐI KHÔNG tự chẩn đoán bệnh nặng (ung thư, nhồi máu cơ tim, đột quỵ...).
                3. Với triệu chứng nguy hiểm (đau ngực dữ dội, khó thở, méo miệng, co giật), yêu cầu gọi cấp cứu 115 NGAY.
                4. Tư vấn được các bệnh thông thường: cảm cúm, đau đầu nhẹ, rối loạn tiêu hóa, dị ứng da nhẹ.
                5. Về thuốc: luôn nhắc KHÔNG tự ý dùng thuốc kê đơn khi chưa có bác sĩ chỉ định.
                6. Khi người dùng mô tả triệu chứng, gợi ý chuyên khoa phù hợp và khuyến khích đặt lịch.
                7. Trả lời ngắn gọn, đúng trọng tâm. Dùng emoji phù hợp để dễ đọc.
                8. Nếu câu hỏi ngoài phạm vi y tế, từ chối khéo léo và hướng về tư vấn sức khỏe.

                === THÔNG TIN BỆNH VIỆN KIM QUY ===
                - Địa chỉ: 123 Đường Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh
                - Giờ làm việc: Thứ 2 - Thứ 7: 7:30 - 12:00 và 13:30 - 17:00
                - Chủ nhật: Chỉ tiếp nhận cấp cứu
                - Cấp cứu 24/7 - Hotline cấp cứu: 1900 1234
                - Hotline đặt lịch: 1900 5678
                - Email: info@kimquyhospital.vn
                - Website: www.kimquyhospital.vn

                === CÁCH GỢI Ý ĐẶT LỊCH ===
                Khi người dùng có triệu chứng, hãy:
                1. Tư vấn ngắn về triệu chứng
                2. Gợi ý chuyên khoa phù hợp
                3. Khuyến khích đặt lịch: "Bạn có muốn tôi giúp đặt lịch khám không?"

                """);

        // Inject specialties from DB
        try {
            List<Specialty> specialties = specialtyRepository.findAll();
            if (!specialties.isEmpty()) {
                sb.append("=== CHUYÊN KHOA HIỆN CÓ TẠI BỆNH VIỆN ===\n");
                specialties.forEach(s -> sb.append("- ").append(s.getName())
                        .append(s.getDescription() != null && !s.getDescription().isBlank()
                                ? ": " + s.getDescription() : "")
                        .append("\n"));
                sb.append("\n");
            }
        } catch (Exception e) {
            log.warn("Could not load specialties for system prompt", e);
        }

        // Inject top 5 doctors from DB
        try {
            List<Doctor> topDoctors = doctorRepository.findTop3ByOrderByRatingDesc(PageRequest.of(0, 5));
            if (!topDoctors.isEmpty()) {
                sb.append("=== BÁC SĨ NỔI BẬT ===\n");
                topDoctors.forEach(d -> {
                    String specialty = d.getSpecialty() != null ? d.getSpecialty().getName() : "Tổng quát";
                    String degree = d.getDegree() != null ? d.getDegree() : "BS";
                    long fee = d.getClinicFee() != null ? d.getClinicFee().longValue() : 0;
                    sb.append(String.format("- %s %s (Chuyên khoa: %s, Phí: %,d VNĐ)\n",
                            degree, d.getFullName(), specialty, fee));
                });
                sb.append("\n");
            }
        } catch (Exception e) {
            log.warn("Could not load top doctors for system prompt", e);
        }

        // Inject medical services from DB
        try {
            List<MedicalService> services = medicalServiceRepository.findAll().stream().limit(10).toList();
            if (!services.isEmpty()) {
                sb.append("=== DỊCH VỤ Y TẾ ===\n");
                services.forEach(s -> sb.append("- ").append(s.getName())
                        .append(s.getPrice() != null ? String.format(" (Giá: %,d VNĐ)", s.getPrice()) : "")
                        .append("\n"));
                sb.append("\n");
            }
        } catch (Exception e) {
            log.warn("Could not load medical services for system prompt", e);
        }

        sb.append("=== NHẮC NHỞ ===\n");
        sb.append("Luôn ưu tiên sức khỏe và sự an toàn của bệnh nhân. ");
        sb.append("Trả lời chính xác, trung thực, và hướng dẫn người dùng sử dụng dịch vụ bệnh viện khi cần thiết.");
        return sb.toString();
    }

    // ================================================================
    // QUALITY METRICS
    // ================================================================

    private void recordFallbackQuestion(String question) {
        totalChatFallbacks.increment();
        String normalized = question == null ? "unknown" : question.toLowerCase().trim();
        String bucket = normalized.length() > 120 ? normalized.substring(0, 120) : normalized;
        failedQuestionCounter.computeIfAbsent(bucket, k -> new LongAdder()).increment();
    }

    public Map<String, Object> getChatQualityMetrics() {
        long total = totalChatRequests.sum();
        long fallback = totalChatFallbacks.sum();

        List<Map<String, Object>> topFailedQuestions = failedQuestionCounter.entrySet()
                .stream()
                .sorted((a, b) -> Long.compare(b.getValue().sum(), a.getValue().sum()))
                .limit(10)
                .map(entry -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("question", entry.getKey());
                    item.put("count", entry.getValue().sum());
                    return item;
                })
                .collect(Collectors.toList());

        double fallbackRate = total == 0 ? 0.0 : (double) fallback / total;

        Map<String, Object> rates = new LinkedHashMap<>();
        rates.put("fallbackRate", fallbackRate);

        Map<String, Object> counters = new LinkedHashMap<>();
        counters.put("totalRequests", total);
        counters.put("fallbackCount", fallback);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("rates", rates);
        payload.put("counters", counters);
        payload.put("topFailedQuestions", topFailedQuestions);
        payload.put("generatedAt", java.time.OffsetDateTime.now().toString());
        return payload;
    }
}
