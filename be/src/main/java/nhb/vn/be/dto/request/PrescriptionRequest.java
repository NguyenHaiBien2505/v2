package nhb.vn.be.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PrescriptionRequest {
    String diagnosis;
    String notes;
    Long appointmentId;
    List<PrescriptionDetailRequest> details;
}
