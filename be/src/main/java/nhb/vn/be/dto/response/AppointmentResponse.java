package nhb.vn.be.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AppointmentResponse {
    Long id;
    LocalDate appointmentDate;
    LocalTime startTime;
    LocalTime endTime;
    String status;
    String reason;
    String notes;
    Integer queueNumber;
    String appointmentType;

    UUID patientId;
    String patientName;
    String patientAvatar;

    UUID doctorId;
    String doctorName;
    String doctorAvatar;

    Long scheduleId;
}