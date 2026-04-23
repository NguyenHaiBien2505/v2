package nhb.vn.be.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MedicalServiceResponse {
    Long id;
    String name;
    String description;
    String icon;
    String category;
    String price;
    String image;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}