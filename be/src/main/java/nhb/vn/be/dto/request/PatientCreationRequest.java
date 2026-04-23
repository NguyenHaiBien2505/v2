package nhb.vn.be.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PatientCreationRequest {
    @NotBlank(message = "FULLNAME_REQUIRED")
    String fullName;

    String phone;
    String address;
    String gender;
    String bloodType;
    String allergies;
    String medicalHistory;
    LocalDate dob;

    @NotBlank(message = "USERNAME_REQUIRED")
    String username;

    String password;
}