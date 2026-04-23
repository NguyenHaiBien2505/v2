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
public class ScheduleRequest {
    @NotNull(message = "WORK_DATE_REQUIRED")
    LocalDate workDate;

    @NotNull(message = "START_TIME_REQUIRED")
    LocalTime startTime;

    @NotNull(message = "END_TIME_REQUIRED")
    LocalTime endTime;

    @NotNull(message = "MAX_PATIENT_REQUIRED")
    int maxPatient;

    String status;
}