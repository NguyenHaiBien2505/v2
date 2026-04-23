package nhb.vn.be.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DoctorResponse {
    UUID id;
    String fullName;
    String degree;
    String avatarUrl;
    String bio;
    int experienceYears;
    BigDecimal clinicFee;
    String licenseNumber;
    String phone;
    UserResponse user;
    SpecialtyResponse specialty;
    Set<ReviewResponse> reviews;
    Double averageRating;
    Long totalReviews;
}
