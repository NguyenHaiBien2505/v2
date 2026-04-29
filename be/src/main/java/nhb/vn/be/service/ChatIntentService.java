package nhb.vn.be.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
public class ChatIntentService {

    // Dùng regex đơn giản hoặc có thể gọi AI nhẹ (Gemini Flash)
    public IntentResult detectIntent(String message) {
        String lower = message.toLowerCase();

        if (lower.contains("đặt lịch") || lower.contains("hẹn khám") ||
                lower.contains("đăng ký khám") || lower.contains("book")) {
            return new IntentResult("BOOKING", extractDoctorName(message));
        }

        if (lower.contains("bác sĩ nào") || lower.contains("gợi ý bác sĩ") ||
                lower.contains("tìm bác sĩ") || lower.contains("chuyển khoa")) {
            return new IntentResult("SUGGEST_DOCTOR", extractSpecialtyOrSymptom(message));
        }

        if (lower.contains("lịch rảnh") || lower.contains("khi nào") ||
                lower.contains("ngày nào") || lower.contains("còn lịch")) {
            return new IntentResult("CHECK_SCHEDULE", extractDoctorName(message));
        }

        if (lower.contains("cảm ơn") || lower.contains("ok") || lower.contains("đồng ý")) {
            return new IntentResult("CONFIRM", null);
        }

        return new IntentResult("MEDICAL_ADVICE", null); // fallback
    }

    private String extractDoctorName(String text) {
        // Giả lập: nếu có "bác sĩ [tên]" thì trích xuất
        Pattern pattern = Pattern.compile("bác sĩ\\s+([A-Za-zÀ-ỹ\\s]+)");
        Matcher matcher = pattern.matcher(text);
        return matcher.find() ? matcher.group(1).trim() : null;
    }

    private String extractSpecialtyOrSymptom(String text) {
        // Nếu có chuyên khoa: "khoa tim mạch", "nội tiết"...
        return null; // để AI xử lý
    }

    record IntentResult(String intent, String extractedEntity) {}
}
