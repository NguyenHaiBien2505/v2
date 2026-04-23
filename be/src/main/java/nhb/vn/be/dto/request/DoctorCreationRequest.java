package nhb.vn.be.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DoctorCreationRequest {
    @NotBlank(message = "FULLNAME_REQUIRED")
    String fullName;

    String degree;
    String avatarUrl;
    String bio;

    @Min(value = 0, message = "INVALID_EXPERIENCE")
    int experienceYears;

    @NotNull(message = "CLINIC_FEE_REQUIRED")
    BigDecimal clinicFee;

    String licenseNumber;
    String phone;

    @NotNull(message = "SPECIALTY_REQUIRED")
    Long specialtyId;

    @NotBlank(message = "USERNAME_REQUIRED")
    String username;

    String password;
}

