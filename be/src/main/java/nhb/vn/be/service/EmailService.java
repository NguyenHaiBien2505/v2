package nhb.vn.be.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nhb.vn.be.entity.Appointment;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");

    // ──────────────────────────────────────────────────────────────────────────
    // PUBLIC API
    // ──────────────────────────────────────────────────────────────────────────

    /** Gửi email xác nhận đặt lịch thành công */
    @Async
    public void sendBookingConfirmation(Appointment appointment) {
        String email = getEmail(appointment);
        if (email == null) return;

        String patientName = appointment.getPatient() != null ? appointment.getPatient().getFullName() : "Bệnh nhân";
        String doctorName  = appointment.getDoctor()  != null ? appointment.getDoctor().getFullName()  : "Bác sĩ";
        String date = format(appointment, DATE_FMT, "appointmentDate");
        String time = format(appointment, TIME_FMT, "startTime");
        int queue   = appointment.getQueueNumber() != null ? appointment.getQueueNumber() : 0;

        String subject = "✅ Xác nhận đặt lịch khám thành công – KimQuy Health";
        String html = bookingHtml(patientName, doctorName, date, time, queue);

        sendHtml(email, subject, html);
    }

    /** Gửi email thông báo hủy lịch */
    @Async
    public void sendCancellationNotification(Appointment appointment) {
        String email = getEmail(appointment);
        if (email == null) return;

        String patientName = appointment.getPatient() != null ? appointment.getPatient().getFullName() : "Bệnh nhân";
        String doctorName  = appointment.getDoctor()  != null ? appointment.getDoctor().getFullName()  : "Bác sĩ";
        String date = format(appointment, DATE_FMT, "appointmentDate");
        String time = format(appointment, TIME_FMT, "startTime");

        String subject = "❌ Thông báo hủy lịch khám – KimQuy Health";
        String html = cancellationHtml(patientName, doctorName, date, time);

        sendHtml(email, subject, html);
    }

    /** Gửi email nhắc nhở sắp có lịch khám */
    @Async
    public void sendAppointmentReminder(Appointment appointment) {
        String email = getEmail(appointment);
        if (email == null) return;

        String patientName = appointment.getPatient() != null ? appointment.getPatient().getFullName() : "Bệnh nhân";
        String doctorName  = appointment.getDoctor()  != null ? appointment.getDoctor().getFullName()  : "Bác sĩ";
        String date = format(appointment, DATE_FMT, "appointmentDate");
        String time = format(appointment, TIME_FMT, "startTime");
        int queue   = appointment.getQueueNumber() != null ? appointment.getQueueNumber() : 0;

        String subject = "⏰ Nhắc nhở: Bạn có lịch khám vào ngày mai – KimQuy Health";
        String html = reminderHtml(patientName, doctorName, date, time, queue);

        sendHtml(email, subject, html);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ──────────────────────────────────────────────────────────────────────────

    private void sendHtml(String to, String subject, String htmlBody) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true = HTML
            mailSender.send(msg);
            log.info("Email gửi thành công đến {}", to);
        } catch (Exception e) {
            log.error("Không thể gửi email đến {}: {}", to, e.getMessage(), e);
        }
    }

    /** Lấy email của bệnh nhân: patient.user.email */
    private String getEmail(Appointment appointment) {
        try {
            String email = appointment.getPatient().getUser().getEmail();
            if (email == null || email.isBlank()) {
                log.warn("Bệnh nhân {} không có email, bỏ qua",
                        appointment.getPatient().getId());
                return null;
            }
            return email;
        } catch (NullPointerException e) {
            log.warn("Không tìm thấy email của bệnh nhân cho appointment {}", appointment.getId());
            return null;
        }
    }

    /** Helper để format date/time từ appointment */
    private String format(Appointment a, DateTimeFormatter fmt, String field) {
        try {
            if ("appointmentDate".equals(field) && a.getAppointmentDate() != null)
                return a.getAppointmentDate().format(fmt);
            if ("startTime".equals(field) && a.getStartTime() != null)
                return a.getStartTime().format(fmt);
        } catch (Exception ignored) {}
        return "";
    }

    // ──────────────────────────────────────────────────────────────────────────
    // HTML TEMPLATES
    // ──────────────────────────────────────────────────────────────────────────

    private String bookingHtml(String patient, String doctor, String date, String time, int queue) {
        return baseTemplate("Đặt lịch thành công!", "#22c55e",
            "<p>Xin chào <strong>" + esc(patient) + "</strong>,</p>" +
            "<p>Lịch khám của bạn đã được <strong>xác nhận</strong>. Thông tin chi tiết:</p>" +
            infoTable(doctor, date, time, queue) +
            "<p>Vui lòng đến đúng giờ và mang theo CMND/CCCD. Cảm ơn bạn đã tin tưởng KimQuy Health!</p>"
        );
    }

    private String cancellationHtml(String patient, String doctor, String date, String time) {
        return baseTemplate("Lịch khám đã bị hủy", "#ef4444",
            "<p>Xin chào <strong>" + esc(patient) + "</strong>,</p>" +
            "<p>Lịch khám dưới đây đã <strong style='color:#ef4444'>bị hủy</strong>:</p>" +
            "<table style='width:100%;border-collapse:collapse;margin:16px 0'>" +
            "<tr><td style='padding:8px 12px;background:#fef2f2;border-radius:6px'><b>Bác sĩ:</b> " + esc(doctor) + "</td></tr>" +
            "<tr><td style='padding:8px 12px'><b>Ngày:</b> " + esc(date) + " lúc " + esc(time) + "</td></tr>" +
            "</table>" +
            "<p>Nếu bạn không yêu cầu hủy, vui lòng liên hệ hotline ngay. " +
            "Bạn có thể đặt lịch mới tại ứng dụng KimQuy Health.</p>"
        );
    }

    private String reminderHtml(String patient, String doctor, String date, String time, int queue) {
        return baseTemplate("Nhắc nhở lịch khám ngày mai", "#f59e0b",
            "<p>Xin chào <strong>" + esc(patient) + "</strong>,</p>" +
            "<p>Đây là nhắc nhở: bạn có <strong>lịch khám vào ngày mai</strong>. Thông tin:</p>" +
            infoTable(doctor, date, time, queue) +
            "<p>Hãy chuẩn bị đầy đủ và đến đúng giờ. Chúc bạn sức khỏe!</p>"
        );
    }

    private String infoTable(String doctor, String date, String time, int queue) {
        return "<table style='width:100%;border-collapse:collapse;margin:16px 0;border-radius:8px;overflow:hidden'>" +
               "<tr style='background:#f8fafc'>" +
               "  <td style='padding:10px 16px;border-bottom:1px solid #e2e8f0;width:40%'><b>Bác sĩ</b></td>" +
               "  <td style='padding:10px 16px;border-bottom:1px solid #e2e8f0'>" + esc(doctor) + "</td>" +
               "</tr>" +
               "<tr>" +
               "  <td style='padding:10px 16px;border-bottom:1px solid #e2e8f0'><b>Ngày khám</b></td>" +
               "  <td style='padding:10px 16px;border-bottom:1px solid #e2e8f0'>" + esc(date) + "</td>" +
               "</tr>" +
               "<tr style='background:#f8fafc'>" +
               "  <td style='padding:10px 16px;border-bottom:1px solid #e2e8f0'><b>Giờ khám</b></td>" +
               "  <td style='padding:10px 16px;border-bottom:1px solid #e2e8f0'>" + esc(time) + "</td>" +
               "</tr>" +
               "<tr>" +
               "  <td style='padding:10px 16px'><b>Số thứ tự</b></td>" +
               "  <td style='padding:10px 16px'><span style='background:#dbeafe;color:#1d4ed8;padding:2px 10px;border-radius:999px;font-weight:bold'>#" + queue + "</span></td>" +
               "</tr>" +
               "</table>";
    }

    private String baseTemplate(String title, String accentColor, String body) {
        return "<!DOCTYPE html><html lang='vi'><head><meta charset='UTF-8'/></head><body " +
               "style='margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif'>" +
               "<table width='100%' cellpadding='0' cellspacing='0' style='padding:40px 0'><tr><td align='center'>" +
               "<table width='600' cellpadding='0' cellspacing='0' " +
               "style='background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08)'>" +
               // Header
               "<tr><td style='background:" + accentColor + ";padding:32px 40px;text-align:center'>" +
               "<h1 style='margin:0;color:#fff;font-size:24px;font-weight:700'>" + esc(title) + "</h1>" +
               "<p style='margin:8px 0 0;color:rgba(255,255,255,.85);font-size:14px'>KimQuy Health Connect</p>" +
               "</td></tr>" +
               // Body
               "<tr><td style='padding:32px 40px;color:#334155;font-size:15px;line-height:1.7'>" +
               body +
               "</td></tr>" +
               // Footer
               "<tr><td style='background:#f8fafc;padding:20px 40px;text-align:center;" +
               "color:#94a3b8;font-size:13px;border-top:1px solid #e2e8f0'>" +
               "<p style='margin:0'>© 2025 KimQuy Health · Email này được gửi tự động, vui lòng không trả lời.</p>" +
               "</td></tr>" +
               "</table></td></tr></table></body></html>";
    }

    /** Escape HTML để tránh XSS */
    private String esc(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}
