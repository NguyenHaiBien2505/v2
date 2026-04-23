package nhb.vn.be.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AppointmentRequest {
    @NotNull(message = "APPOINTMENT_DATE_REQUIRED")
    LocalDate appointmentDate;

    @NotNull(message = "START_TIME_REQUIRED")
    LocalTime startTime;

    String reason;
    String appointmentType;
}