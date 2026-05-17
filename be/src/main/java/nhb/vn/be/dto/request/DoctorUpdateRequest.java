package nhb.vn.be.dto.request;

import jakarta.validation.constraints.Email;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DoctorUpdateRequest {
    String fullName;
    String degree;
    String avatarUrl;
    String bio;
    Integer experienceYears;
    BigDecimal clinicFee;
    String licenseNumber;
    String phone;

    @Email(message = "EMAIL_INVALID")
    String email;

    Long specialtyId;
}