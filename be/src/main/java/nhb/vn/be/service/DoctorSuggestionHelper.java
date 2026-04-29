package nhb.vn.be.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nhb.vn.be.dto.request.DoctorSuggestionDTO;
import nhb.vn.be.entity.Doctor;
import nhb.vn.be.entity.Specialty;
import nhb.vn.be.repository.DoctorRepository;
import nhb.vn.be.repository.SpecialtyRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DoctorSuggestionHelper {

    private final DoctorRepository doctorRepository;
    private final SpecialtyRepository specialtyRepository;

    private static final String HOTLINE = "1900-1234";
    private static final int MAX_DOCTORS = 3;

    // ================================================================
    // SINGLE SOURCE OF TRUTH: Symptom → Specialty map
    // Hợp nhất từ ChatService.extractSpecialtyOrSymptom và DoctorSuggestionHelper cũ
    // ================================================================
    private static final Map<String, String> SYMPTOM_TO_SPECIALTY = new LinkedHashMap<>();

    static {
        // Tim mạch
        SYMPTOM_TO_SPECIALTY.put("tim mạch", "Tim mạch");
        SYMPTOM_TO_SPECIALTY.put("đau thắt ngực", "Tim mạch");
        SYMPTOM_TO_SPECIALTY.put("huyết áp", "Tim mạch");
        SYMPTOM_TO_SPECIALTY.put("hồi hộp", "Tim mạch");
        SYMPTOM_TO_SPECIALTY.put("tim đập", "Tim mạch");
        SYMPTOM_TO_SPECIALTY.put("ngực", "Tim mạch");
        SYMPTOM_TO_SPECIALTY.put("tim", "Tim mạch");

        // Thần kinh
        SYMPTOM_TO_SPECIALTY.put("đau đầu", "Thần kinh");
        SYMPTOM_TO_SPECIALTY.put("chóng mặt", "Thần kinh");
        SYMPTOM_TO_SPECIALTY.put("hoa mắt", "Thần kinh");
        SYMPTOM_TO_SPECIALTY.put("tê bì", "Thần kinh");
        SYMPTOM_TO_SPECIALTY.put("co giật", "Thần kinh");
        SYMPTOM_TO_SPECIALTY.put("mất ngủ", "Thần kinh");
        SYMPTOM_TO_SPECIALTY.put("thần kinh", "Thần kinh");

        // Nhi khoa
        SYMPTOM_TO_SPECIALTY.put("trẻ sơ sinh", "Nhi khoa");
        SYMPTOM_TO_SPECIALTY.put("trẻ em", "Nhi khoa");
        SYMPTOM_TO_SPECIALTY.put("em bé", "Nhi khoa");
        SYMPTOM_TO_SPECIALTY.put("nhi", "Nhi khoa");
        SYMPTOM_TO_SPECIALTY.put("bé", "Nhi khoa");
        SYMPTOM_TO_SPECIALTY.put("con", "Nhi khoa");

        // Cơ xương khớp
        SYMPTOM_TO_SPECIALTY.put("gai cột sống", "Cơ xương khớp");
        SYMPTOM_TO_SPECIALTY.put("viêm khớp", "Cơ xương khớp");
        SYMPTOM_TO_SPECIALTY.put("thoái hóa", "Cơ xương khớp");
        SYMPTOM_TO_SPECIALTY.put("xương khớp", "Cơ xương khớp");
        SYMPTOM_TO_SPECIALTY.put("đau khớp", "Cơ xương khớp");
        SYMPTOM_TO_SPECIALTY.put("đau lưng", "Cơ xương khớp");
        SYMPTOM_TO_SPECIALTY.put("khớp", "Cơ xương khớp");
        SYMPTOM_TO_SPECIALTY.put("xương", "Cơ xương khớp");

        // Da liễu
        SYMPTOM_TO_SPECIALTY.put("mẩn ngứa", "Da liễu");
        SYMPTOM_TO_SPECIALTY.put("nổi mẩn", "Da liễu");
        SYMPTOM_TO_SPECIALTY.put("phát ban", "Da liễu");
        SYMPTOM_TO_SPECIALTY.put("nổi mụn", "Da liễu");
        SYMPTOM_TO_SPECIALTY.put("vảy nến", "Da liễu");
        SYMPTOM_TO_SPECIALTY.put("da liễu", "Da liễu");
        SYMPTOM_TO_SPECIALTY.put("ngứa", "Da liễu");
        SYMPTOM_TO_SPECIALTY.put("ghẻ", "Da liễu");
        SYMPTOM_TO_SPECIALTY.put("da", "Da liễu");

        // Răng hàm mặt
        SYMPTOM_TO_SPECIALTY.put("nhổ răng", "Răng hàm mặt");
        SYMPTOM_TO_SPECIALTY.put("sâu răng", "Răng hàm mặt");
        SYMPTOM_TO_SPECIALTY.put("răng", "Răng hàm mặt");
        SYMPTOM_TO_SPECIALTY.put("lợi", "Răng hàm mặt");

        // Tai mũi họng
        SYMPTOM_TO_SPECIALTY.put("viêm amidan", "Tai mũi họng");
        SYMPTOM_TO_SPECIALTY.put("viêm họng", "Tai mũi họng");
        SYMPTOM_TO_SPECIALTY.put("tai mũi họng", "Tai mũi họng");
        SYMPTOM_TO_SPECIALTY.put("họng", "Tai mũi họng");
        SYMPTOM_TO_SPECIALTY.put("mũi", "Tai mũi họng");
        SYMPTOM_TO_SPECIALTY.put("tai", "Tai mũi họng");

        // Mắt
        SYMPTOM_TO_SPECIALTY.put("đau mắt", "Mắt");
        SYMPTOM_TO_SPECIALTY.put("đỏ mắt", "Mắt");
        SYMPTOM_TO_SPECIALTY.put("cận thị", "Mắt");
        SYMPTOM_TO_SPECIALTY.put("loạn thị", "Mắt");
        SYMPTOM_TO_SPECIALTY.put("mắt", "Mắt");

        // Sản phụ khoa
        SYMPTOM_TO_SPECIALTY.put("kinh nguyệt", "Sản phụ khoa");
        SYMPTOM_TO_SPECIALTY.put("mang thai", "Sản phụ khoa");
        SYMPTOM_TO_SPECIALTY.put("phụ khoa", "Sản phụ khoa");
        SYMPTOM_TO_SPECIALTY.put("sản", "Sản phụ khoa");

        // Hô hấp
        SYMPTOM_TO_SPECIALTY.put("viêm phổi", "Hô hấp");
        SYMPTOM_TO_SPECIALTY.put("hen suyễn", "Hô hấp");
        SYMPTOM_TO_SPECIALTY.put("khó thở", "Hô hấp");
        SYMPTOM_TO_SPECIALTY.put("hô hấp", "Hô hấp");
        SYMPTOM_TO_SPECIALTY.put("lao", "Hô hấp");
        SYMPTOM_TO_SPECIALTY.put("ho", "Hô hấp");

        // Tiêu hóa
        SYMPTOM_TO_SPECIALTY.put("trào ngược", "Tiêu hóa");
        SYMPTOM_TO_SPECIALTY.put("đại tràng", "Tiêu hóa");
        SYMPTOM_TO_SPECIALTY.put("buồn nôn", "Tiêu hóa");
        SYMPTOM_TO_SPECIALTY.put("đau bụng", "Tiêu hóa");
        SYMPTOM_TO_SPECIALTY.put("tiêu hóa", "Tiêu hóa");
        SYMPTOM_TO_SPECIALTY.put("dạ dày", "Tiêu hóa");
        SYMPTOM_TO_SPECIALTY.put("gan", "Tiêu hóa");

        // Nội tiết
        SYMPTOM_TO_SPECIALTY.put("tuyến giáp", "Nội tiết");
        SYMPTOM_TO_SPECIALTY.put("tiểu đường", "Nội tiết");
        SYMPTOM_TO_SPECIALTY.put("nội tiết", "Nội tiết");

        // Nội tổng quát
        SYMPTOM_TO_SPECIALTY.put("mệt mỏi", "Nội tổng quát");
        SYMPTOM_TO_SPECIALTY.put("tổng quát", "Nội tổng quát");
        SYMPTOM_TO_SPECIALTY.put("sốt", "Nội tổng quát");
    }

    // ================================================================
    // PUBLIC API
    // ================================================================

    /**
     * High-level handler: given a raw user message, map symptom → specialty,
     * query DB for doctors, and return a formatted Markdown response.
     * Called by ChatService when intent == SUGGEST_DOCTOR.
     */
    public String handleSuggestDoctor(String message) {
        String specialty = mapSymptomToSpecialty(message);
        List<Doctor> doctors = suggestDoctorsBySpecialty(specialty);
        return buildDoctorListMarkdown(doctors);
    }

    /**
     * Map triệu chứng / từ khóa sang tên chuyên khoa.
     * Dùng longest-match để ưu tiên từ khóa cụ thể hơn.
     *
     * @param normalizedMessage tin nhắn (có thể có dấu, lowercase)
     * @return tên chuyên khoa hoặc null nếu không tìm thấy
     */
    public String mapSymptomToSpecialty(String normalizedMessage) {
        if (normalizedMessage == null || normalizedMessage.trim().isEmpty()) {
            return null;
        }

        String lower = normalizedMessage.toLowerCase();
        String matchedSpecialty = null;
        int maxMatchLength = 0;

        for (Map.Entry<String, String> entry : SYMPTOM_TO_SPECIALTY.entrySet()) {
            String keyword = entry.getKey();
            if (lower.contains(keyword) && keyword.length() > maxMatchLength) {
                maxMatchLength = keyword.length();
                matchedSpecialty = entry.getValue();
            }
        }

        return matchedSpecialty;
    }

    /**
     * Truy vấn DB lấy tối đa 3 bác sĩ thuộc chuyên khoa, sắp xếp theo rating giảm dần.
     * Fallback: trả về top-rated doctors nếu không tìm thấy chuyên khoa.
     *
     * @param specialty tên chuyên khoa
     * @return danh sách bác sĩ (không bao giờ null)
     */
    public List<Doctor> suggestDoctorsBySpecialty(String specialty) {
        log.info("Suggesting doctors by specialty: {}", specialty);

        if (specialty != null && !specialty.trim().isEmpty()) {
            // Tìm chính xác trước
            Optional<Specialty> specialtyOpt = specialtyRepository.findByNameIgnoreCase(specialty);
            if (specialtyOpt.isPresent()) {
                List<Doctor> doctors = findTopDoctorsBySpecialtyId(specialtyOpt.get().getId());
                if (!doctors.isEmpty()) {
                    return doctors;
                }
            }

            // Tìm gần đúng (chứa tên)
            List<Specialty> partialMatches = specialtyRepository.findByNameContainingIgnoreCase(specialty);
            for (Specialty spec : partialMatches) {
                List<Doctor> doctors = findTopDoctorsBySpecialtyId(spec.getId());
                if (!doctors.isEmpty()) {
                    return doctors;
                }
            }
        }

        // Fallback: top 3 bác sĩ rating cao nhất
        log.info("No doctors found for specialty '{}', returning top rated doctors", specialty);
        return doctorRepository.findTop3ByOrderByRatingDesc(PageRequest.of(0, MAX_DOCTORS));
    }

    /**
     * Xây dựng Markdown có cấu trúc cho danh sách bác sĩ.
     * Bao gồm: tên, chuyên khoa, học vị, đánh giá trung bình, số lượt đánh giá, phí khám.
     *
     * @param doctors danh sách bác sĩ
     * @return chuỗi Markdown hoặc fallback message nếu danh sách rỗng
     */
    public String buildDoctorListMarkdown(List<Doctor> doctors) {
        if (doctors == null || doctors.isEmpty()) {
            return buildFallbackMessage();
        }

        StringBuilder sb = new StringBuilder();
        sb.append("👨‍⚕️ **DANH SÁCH BÁC SĨ PHÙ HỢP**\n\n");

        for (Doctor doctor : doctors) {
            Double avgRating = doctorRepository.getAverageRating(doctor.getId());
            Long totalReviews = doctorRepository.getTotalReviews(doctor.getId());
            double rating = avgRating != null ? avgRating : 4.5;

            sb.append("✨ **").append(doctor.getFullName()).append("**\n");
            sb.append("   📍 Chuyên khoa: ")
              .append(doctor.getSpecialty() != null ? doctor.getSpecialty().getName() : "Chuyên khoa tổng quát")
              .append("\n");
            sb.append("   🎓 Học vị: ")
              .append(doctor.getDegree() != null ? doctor.getDegree() : "Bác sĩ chuyên khoa")
              .append("\n");
            sb.append("   ⭐ Đánh giá: ").append(String.format("%.1f", rating)).append("/5");
            if (totalReviews != null && totalReviews > 0) {
                sb.append(" (").append(totalReviews).append(" lượt đánh giá)");
            }
            sb.append("\n");
            sb.append("   💰 Phí khám: ")
              .append(doctor.getClinicFee() != null
                      ? String.format("%,.0f VNĐ", doctor.getClinicFee())
                      : "Liên hệ để biết thêm")
              .append("\n\n");
        }

        sb.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n");
        sb.append("👉 **Bạn muốn:**\n");
        sb.append("• Xem lịch rảnh? Nói \"Xem lịch bác sĩ [tên]\"\n");
        sb.append("• Đặt lịch ngay? Nói \"Đặt lịch với bác sĩ [tên]\"\n");
        sb.append("• Tìm bác sĩ khác? Mô tả thêm triệu chứng của bạn");

        return sb.toString();
    }

    /**
     * Gợi ý bác sĩ dựa trên triệu chứng (dùng mapSymptomToSpecialty nội bộ).
     */
    public List<Doctor> suggestDoctorsBySymptom(String symptom, int limit) {
        log.info("Suggesting doctors for symptom: {}", symptom);
        String specialtyName = mapSymptomToSpecialty(symptom);
        log.info("Mapped to specialty: {}", specialtyName);

        List<Doctor> doctors = suggestDoctorsBySpecialty(specialtyName);
        return doctors.stream().limit(limit).collect(Collectors.toList());
    }

    /**
     * Gợi ý bác sĩ theo bệnh lý (alias cho suggestDoctorsBySymptom).
     */
    public List<Doctor> suggestDoctorsByDisease(String disease, int limit) {
        return suggestDoctorsBySymptom(disease, limit);
    }

    /**
     * Lấy danh sách bác sĩ kèm rating DTO.
     */
    public List<DoctorSuggestionDTO> getDoctorSuggestionsWithRating(List<Doctor> doctors) {
        List<DoctorSuggestionDTO> result = new ArrayList<>();

        for (Doctor doctor : doctors) {
            Double avgRating = doctorRepository.getAverageRating(doctor.getId());
            Long totalReviews = doctorRepository.getTotalReviews(doctor.getId());

            DoctorSuggestionDTO dto = DoctorSuggestionDTO.builder()
                    .id(doctor.getId())
                    .fullName(doctor.getFullName())
                    .degree(doctor.getDegree())
                    .specialtyName(doctor.getSpecialty() != null ? doctor.getSpecialty().getName() : "")
                    .experienceYears(doctor.getExperienceYears())
                    .clinicFee(doctor.getClinicFee())
                    .averageRating(avgRating != null ? avgRating : 4.5)
                    .totalReviews(totalReviews != null ? totalReviews : 0L)
                    .bio(doctor.getBio())
                    .build();

            result.add(dto);
        }

        return result;
    }

    // ================================================================
    // PRIVATE HELPERS
    // ================================================================

    /**
     * Truy vấn bác sĩ theo specialtyId, sắp xếp theo rating giảm dần, tối đa MAX_DOCTORS.
     */
    private List<Doctor> findTopDoctorsBySpecialtyId(Long specialtyId) {
        // Lấy tất cả bác sĩ thuộc chuyên khoa rồi sort theo rating
        List<Doctor> all = doctorRepository.findBySpecialtyId(specialtyId);
        return all.stream()
                .sorted(Comparator.comparingDouble(d -> {
                    Double r = doctorRepository.getAverageRating(d.getId());
                    return r != null ? -r : -4.5; // âm để sort giảm dần
                }))
                .limit(MAX_DOCTORS)
                .collect(Collectors.toList());
    }

    /**
     * Thông báo fallback khi không tìm thấy bác sĩ.
     */
    private String buildFallbackMessage() {
        return "😔 **Rất tiếc, hiện tại chưa có bác sĩ phù hợp trong hệ thống.**\n\n" +
               "Bạn có thể:\n" +
               "• 📞 Liên hệ hotline **" + HOTLINE + "** để được hỗ trợ trực tiếp\n" +
               "• 🔍 Thử tìm kiếm với chuyên khoa khác\n" +
               "• 📅 Đặt lịch khám tổng quát để được tư vấn thêm";
    }
}
