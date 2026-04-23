package nhb.vn.be.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ScheduleResponse {
    Long id;
    LocalDate workDate;
    LocalTime startTime;
    LocalTime endTime;
    int maxPatient;
    int bookedCount;
    String status;
    UUID doctorId;
    String doctorName;
}
