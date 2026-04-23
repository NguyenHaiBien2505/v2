package nhb.vn.be.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MedicalRecordResponse {
    Long id;
    String title;
    LocalDate date;
    String status;
    String icon;
    String iconBg;
    String iconColor;
    String diagnosis;
    String notes;

    UUID patientId;
    String patientName;

    UUID doctorId;
    String doctorName;

    Long appointmentId;
}