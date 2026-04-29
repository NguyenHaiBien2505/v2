package nhb.vn.be.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nhb.vn.be.entity.Doctor;
import nhb.vn.be.repository.DoctorRepository;
import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Classifies user message into one of the supported intents.
 * Supported intents:
 *   SUGGEST_DOCTOR, CHECK_SCHEDULE, BOOKING, CONFIRM_BOOKING,
 *   CANCEL_BOOKING, VIEW_APPOINTMENTS, HOSPITAL_INFO, MEDICAL_ADVICE
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class IntentClassifier {

    private final DoctorRepository doctorRepository;

    public IntentResult classify(String message) {
        return classify(message, false);
    }

    public IntentResult classify(String message, boolean hasActiveBooking) {
        if (message == null || message.isBlank()) {
            return new IntentResult("MEDICAL_ADVICE", null);
        }

        String lower = message.toLowerCase(Locale.ROOT).trim();
        String normalized = normalizeText(message);

        // Context-aware: active booking session
        if (hasActiveBooking) {
            boolean hasDateOrTime = lower.matches(".*\\d{1,2}[/\\-]\\d{1,2}.*")
                    || lower.matches(".*\\d{1,2}h.*")
                    || containsAny(normalized, "ngay", "mai", "thu", "tomorrow", "hom nay", "toi", "sang");
            boolean hasConfirmWord = containsAny(normalized,
                    "dong y", "ok", "cam on", "dat", "xac nhan", "confirm", "duoc", "chon", "ung y", "nhe");
            if (hasDateOrTime || hasConfirmWord) {
                return new IntentResult("CONFIRM_BOOKING", null);
            }
        }

        // Huy lich (truoc BOOKING de tranh nham)
        if (containsAny(normalized, "huy lich", "huy dat", "khong dat nua", "cancel lich", "huy hen",
                "thoi khoi dat", "khong can dat nua", "khong muon dat")) {
            return new IntentResult("CANCEL_BOOKING", null);
        }

        // Xem lich hen da dat
        if (containsAny(normalized,
                "lich hen cua toi", "lich kham cua toi", "da dat lich nao",
                "appointment cua toi", "my appointment", "cho toi xem lich",
                "lich hen sap toi", "lich da dat", "lich dang cho", "trang thai lich")) {
            return new IntentResult("VIEW_APPOINTMENTS", null);
        }

        // Dat lich kham
        if (containsAny(normalized,
                "dat lich", "hen kham", "dang ky kham", "book lich",
                "tao lich hen", "muon kham", "can kham", "muon gap bac si",
                "dat hen kham", "dang ky hen", "xep lich kham", "kham bac si")) {
            return new IntentResult("BOOKING", extractDoctorName(message));
        }

        // Xac nhan dat lich
        if (containsAny(normalized, "dong y", "ok", "xac nhan", "confirm", "ung y")
                && (lower.matches(".*\\d{1,2}[/\\-]\\d{1,2}.*")
                    || lower.matches(".*\\d{1,2}h.*")
                    || containsAny(normalized, "ngay", "mai", "thu", "tomorrow"))) {
            return new IntentResult("CONFIRM_BOOKING", null);
        }

        // Kiem tra lich ranh bac si
        if (containsAny(normalized,
                "lich ranh", "khi nao ranh", "ngay nao ranh", "con lich",
                "xem lich bac si", "lich trong cua bac si", "gio lam viec bac si",
                "lich kham cua bac si", "lich cua bac si", "available slot",
                "bac si co ranh", "bac si con ranh")
            || (containsAny(normalized, "bac si") && containsAny(normalized, "lich", "ranh", "ngay nao", "khi nao"))) {
            return new IntentResult("CHECK_SCHEDULE", extractDoctorName(message));
        }

        // Goi y bac si
        if (containsAny(normalized,
                "goi y bac si", "tim bac si", "bac si nao tot", "bac si gioi",
                "chuyen khoa nao", "kham khoa nao", "nen kham dau", "doctor recommendation",
                "bac si nao phu hop", "tu van bac si", "nen gap bac si nao")
                || (containsAny(normalized, "bi", "dau", "trieu chung", "benh", "sot", "met moi")
                    && containsAny(normalized, "nen kham", "kham o dau", "khoa nao", "bac si nao"))) {
            return new IntentResult("SUGGEST_DOCTOR", extractSpecialtyOrSymptom(message));
        }

        // Hoi ve benh vien / dich vu / gia
        if (containsAny(normalized,
                "benh vien", "phi kham", "gio lam viec", "gio mo cua", "dia chi",
                "hotline", "so dien thoai", "lien he", "hospital info", "address",
                "gia kham", "chi phi kham", "bao hiem", "thanh toan",
                "may gio mo", "tien kham", "phi dich vu", "dich vu kham")) {
            return new IntentResult("HOSPITAL_INFO", null);
        }

        // Fallback: tu van y te / AI
        return new IntentResult("MEDICAL_ADVICE", null);
    }

    public String extractDoctorName(String text) {
        Pattern pattern = Pattern.compile(
                "(?:bac si|bs\\.?)\\s+([A-Za-z\\u00C0-\\u1EF9\\s]{2,40}?)(?=\\s*(?:ngay|gio|luc|vao|de|o|cua|voi|,|\\.|$))");
        Matcher matcher = pattern.matcher(text.toLowerCase(Locale.ROOT));
        if (matcher.find()) {
            String name = matcher.group(1).trim();
            if (!name.isEmpty()) {
                // Map back to correct case from DB
                String lowerText = text.toLowerCase(Locale.ROOT);
                List<Doctor> doctors = doctorRepository.findByFullNameContainingIgnoreCase(name);
                if (!doctors.isEmpty()) return doctors.get(0).getFullName();
            }
        }

        // Pattern viet co dau
        Pattern patternDau = Pattern.compile(
                "(?:b[aas]c s[iia]|bs\\.?)\\s+([A-Za-z\\u00C0-\\u1EF9\\s]{2,40}?)(?=\\s|$|,|\\.|v[oowi]|ng[aà]y|gi[oow]|l[uua]c)");
        Matcher matcherDau = patternDau.matcher(text);
        if (matcherDau.find()) {
            String name = matcherDau.group(1).trim();
            if (!name.isEmpty()) {
                List<Doctor> doctors = doctorRepository.findByFullNameContainingIgnoreCase(name);
                if (!doctors.isEmpty()) return doctors.get(0).getFullName();
                return name;
            }
        }

        // Fuzzy match against DB
        String lowerText = text.toLowerCase(Locale.ROOT);
        List<Doctor> doctors = doctorRepository.findAll();
        doctors.sort(Comparator.comparingInt((Doctor d) -> d.getFullName().length()).reversed());
        for (Doctor doctor : doctors) {
            String doctorName = doctor.getFullName().toLowerCase(Locale.ROOT);
            if (lowerText.contains(doctorName)) {
                return doctor.getFullName();
            }
            String[] parts = doctorName.split("\\s+");
            if (parts.length >= 2) {
                String lastName = parts[parts.length - 1];
                if (lastName.length() > 2 && lowerText.contains(lastName) && lowerText.contains("bac si")) {
                    return doctor.getFullName();
                }
            }
        }
        return null;
    }

    public String extractSpecialtyOrSymptom(String text) {
        String lower = text.toLowerCase(Locale.ROOT);
        Map<String, String> specialtyMap = buildSpecialtyMap();
        List<Map.Entry<String, String>> entries = new ArrayList<>(specialtyMap.entrySet());
        entries.sort((a, b) -> Integer.compare(b.getKey().length(), a.getKey().length()));
        for (Map.Entry<String, String> entry : entries) {
            if (lower.contains(entry.getKey())) {
                return entry.getValue();
            }
        }
        return null;
    }

    public Map<String, String> buildSpecialtyMap() {
        Map<String, String> map = new LinkedHashMap<>();
        map.put("tim m\u1ea1ch", "Tim m\u1ea1ch");
        map.put("\u0111au th\u1eaft ng\u1ef1c", "Tim m\u1ea1ch");
        map.put("huy\u1ebft \u00e1p", "Tim m\u1ea1ch");
        map.put("h\u1ed3i h\u1ed9p", "Tim m\u1ea1ch");
        map.put("tim \u0111\u1eadp nhanh", "Tim m\u1ea1ch");
        map.put("\u0111au ng\u1ef1c", "Tim m\u1ea1ch");
        map.put("tim", "Tim m\u1ea1ch");
        map.put("th\u1ea7n kinh", "Th\u1ea7n kinh");
        map.put("\u0111au \u0111\u1ea7u d\u1eef d\u1ed9i", "Th\u1ea7n kinh");
        map.put("\u0111au \u0111\u1ea7u", "Th\u1ea7n kinh");
        map.put("ch\u00f3ng m\u1eb7t", "Th\u1ea7n kinh");
        map.put("hoa m\u1eaft", "Th\u1ea7n kinh");
        map.put("t\u00ea b\u00ec", "Th\u1ea7n kinh");
        map.put("co gi\u1eadt", "Th\u1ea7n kinh");
        map.put("m\u1ea5t ng\u1ee7", "Th\u1ea7n kinh");
        map.put("\u0111au n\u1eeda \u0111\u1ea7u", "Th\u1ea7n kinh");
        map.put("tr\u1ebb s\u01a1 sinh", "Nhi khoa");
        map.put("tr\u1ebb em", "Nhi khoa");
        map.put("em b\u00e9", "Nhi khoa");
        map.put("nhi khoa", "Nhi khoa");
        map.put("nhi", "Nhi khoa");
        map.put("gai c\u1ed9t s\u1ed1ng", "C\u01a1 x\u01b0\u01a1ng kh\u1edbp");
        map.put("vi\u00eam kh\u1edbp", "C\u01a1 x\u01b0\u01a1ng kh\u1edbp");
        map.put("tho\u00e1i h\u00f3a", "C\u01a1 x\u01b0\u01a1ng kh\u1edbp");
        map.put("x\u01b0\u01a1ng kh\u1edbp", "C\u01a1 x\u01b0\u01a1ng kh\u1edbp");
        map.put("\u0111au kh\u1edbp", "C\u01a1 x\u01b0\u01a1ng kh\u1edbp");
        map.put("\u0111au l\u01b0ng", "C\u01a1 x\u01b0\u01a1ng kh\u1edbp");
        map.put("tho\u00e1t v\u1ecb \u0111\u0129a \u0111\u1ec7m", "C\u01a1 x\u01b0\u01a1ng kh\u1edbp");
        map.put("m\u1ea9n ng\u1ee9a", "Da li\u1ec5u");
        map.put("n\u1ed5i m\u1ea9n", "Da li\u1ec5u");
        map.put("ph\u00e1t ban", "Da li\u1ec5u");
        map.put("n\u1ed5i m\u1ee5n", "Da li\u1ec5u");
        map.put("v\u1ea3y n\u1ebfn", "Da li\u1ec5u");
        map.put("da li\u1ec5u", "Da li\u1ec5u");
        map.put("ng\u1ee9a da", "Da li\u1ec5u");
        map.put("d\u1ecb \u1ee9ng da", "Da li\u1ec5u");
        map.put("nh\u1ed5 r\u0103ng", "R\u0103ng h\u00e0m m\u1eb7t");
        map.put("s\u00e2u r\u0103ng", "R\u0103ng h\u00e0m m\u1eb7t");
        map.put("r\u0103ng h\u00e0m m\u1eb7t", "R\u0103ng h\u00e0m m\u1eb7t");
        map.put("\u0111au r\u0103ng", "R\u0103ng h\u00e0m m\u1eb7t");
        map.put("r\u0103ng", "R\u0103ng h\u00e0m m\u1eb7t");
        map.put("vi\u00eam amidan", "Tai m\u0169i h\u1ecdng");
        map.put("vi\u00eam h\u1ecdng", "Tai m\u0169i h\u1ecdng");
        map.put("tai m\u0169i h\u1ecdng", "Tai m\u0169i h\u1ecdng");
        map.put("\u0111au h\u1ecdng", "Tai m\u0169i h\u1ecdng");
        map.put("s\u1ed5 m\u0169i", "Tai m\u0169i h\u1ecdng");
        map.put("ng\u1ea1t m\u0169i", "Tai m\u0169i h\u1ecdng");
        map.put("\u0111au m\u1eaft", "M\u1eaft");
        map.put("\u0111\u1ecf m\u1eaft", "M\u1eaft");
        map.put("c\u1eadn th\u1ecb", "M\u1eaft");
        map.put("lo\u1ea1n th\u1ecb", "M\u1eaft");
        map.put("m\u1edd m\u1eaft", "M\u1eaft");
        map.put("m\u1eaft", "M\u1eaft");
        map.put("kinh nguy\u1ec7t", "S\u1ea3n ph\u1ee5 khoa");
        map.put("mang thai", "S\u1ea3n ph\u1ee5 khoa");
        map.put("ph\u1ee5 khoa", "S\u1ea3n ph\u1ee5 khoa");
        map.put("s\u1ea3n ph\u1ee5 khoa", "S\u1ea3n ph\u1ee5 khoa");
        map.put("vi\u00eam ph\u1ed5i", "H\u00f4 h\u1ea5p");
        map.put("hen suy\u1ec5n", "H\u00f4 h\u1ea5p");
        map.put("kh\u00f3 th\u1edf", "H\u00f4 h\u1ea5p");
        map.put("h\u00f4 h\u1ea5p", "H\u00f4 h\u1ea5p");
        map.put("ho k\u00e9o d\u00e0i", "H\u00f4 h\u1ea5p");
        map.put("tr\u00e0o ng\u01b0\u1ee3c d\u1ea1 d\u00e0y", "Ti\u00eau h\u00f3a");
        map.put("\u0111\u1ea1i tr\u00e0ng", "Ti\u00eau h\u00f3a");
        map.put("bu\u1ed3n n\u00f4n", "Ti\u00eau h\u00f3a");
        map.put("\u0111au b\u1ee5ng", "Ti\u00eau h\u00f3a");
        map.put("ti\u00eau h\u00f3a", "Ti\u00eau h\u00f3a");
        map.put("d\u1ea1 d\u00e0y", "Ti\u00eau h\u00f3a");
        map.put("t\u00e1o b\u00f3n", "Ti\u00eau h\u00f3a");
        map.put("ti\u00eau ch\u1ea3y", "Ti\u00eau h\u00f3a");
        map.put("tuy\u1ebfn gi\u00e1p", "N\u1ed9i ti\u1ebft");
        map.put("ti\u1ec3u \u0111\u01b0\u1eddng", "N\u1ed9i ti\u1ebft");
        map.put("n\u1ed9i ti\u1ebft", "N\u1ed9i ti\u1ebft");
        map.put("\u0111\u00e1i th\u00e1o \u0111\u01b0\u1eddng", "N\u1ed9i ti\u1ebft");
        map.put("m\u1ec7t m\u1ecfi", "N\u1ed9i t\u1ed5ng qu\u00e1t");
        map.put("t\u1ed5ng qu\u00e1t", "N\u1ed9i t\u1ed5ng qu\u00e1t");
        map.put("s\u1ed1t cao", "N\u1ed9i t\u1ed5ng qu\u00e1t");
        map.put("s\u1ed1t", "N\u1ed9i t\u1ed5ng qu\u00e1t");
        map.put("kh\u00e1m t\u1ed5ng qu\u00e1t", "N\u1ed9i t\u1ed5ng qu\u00e1t");
        return map;
    }

    public String normalizeText(String input) {
        if (input == null) return "";
        String lower = input.toLowerCase(Locale.ROOT).trim();
        String noAccent = Normalizer.normalize(lower, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .replace('\u0111', 'd');
        return noAccent.replaceAll("[^a-z0-9\\s]", " ").replaceAll("\\s+", " ").trim();
    }

    public boolean containsAny(String text, String... keywords) {
        if (text == null || text.isBlank()) return false;
        String paddedText = " " + normalizeText(text) + " ";
        for (String keyword : keywords) {
            String normalizedKeyword = normalizeText(keyword);
            if (normalizedKeyword.isBlank()) continue;
            if (paddedText.contains(" " + normalizedKeyword + " ")) return true;
        }
        return false;
    }
}
