package nhb.vn.be.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PatientUpdateRequest {
    String fullName;
    String phone;
    String address;
    String gender;
    String bloodType;
    String allergies;
    String medicalHistory;
    LocalDate dob;
}
