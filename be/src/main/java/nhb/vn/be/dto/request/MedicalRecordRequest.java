package nhb.vn.be.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MedicalRecordRequest {
    String title;
    LocalDate date;
    String status;
    String icon;
    String iconBg;
    String iconColor;
    String diagnosis;
    String notes;

    @NotNull(message = "PATIENT_ID_REQUIRED")
    UUID patientId;  // ← Thêm field này

    @NotNull(message = "DOCTOR_ID_REQUIRED")
    UUID doctorId;   // ← Thêm field này
    Long appointmentId;
}