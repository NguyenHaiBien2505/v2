package nhb.vn.be.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PatientResponse {
    UUID id;
    String patientCode;
    String fullName;
    String phone;
    String address;
    String gender;
    String bloodType;
    String allergies;
    String medicalHistory;
    LocalDate dob;
    UserResponse user;
}