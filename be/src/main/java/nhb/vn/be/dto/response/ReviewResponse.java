package nhb.vn.be.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReviewResponse {
    Long id;
    int rating;
    String comment;
    UUID patientId;
    String patientName;
    String patientAvatar;
    UUID doctorId;
    String doctorName;
}