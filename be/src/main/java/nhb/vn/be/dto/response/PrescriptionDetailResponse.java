package nhb.vn.be.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PrescriptionDetailResponse {
    Long id;
    String medicineName;
    String frequency;
    String dosage;
    String duration;
    String notes;
}