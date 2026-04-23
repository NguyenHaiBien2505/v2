package nhb.vn.be.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PrescriptionDetailRequest {
    String medicineName;
    String frequency;
    String dosage;
    String duration;
    String notes;
}