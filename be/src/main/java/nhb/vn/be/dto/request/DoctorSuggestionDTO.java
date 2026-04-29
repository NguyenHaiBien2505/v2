package nhb.vn.be.dto.request;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class DoctorSuggestionDTO {
    private UUID id;
    private String fullName;
    private String degree;
    private String specialtyName;
    private int experienceYears;
    private BigDecimal clinicFee;
    private Double averageRating;
    private Long totalReviews;
    private String bio;
}