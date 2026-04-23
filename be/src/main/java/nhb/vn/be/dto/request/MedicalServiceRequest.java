package nhb.vn.be.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MedicalServiceRequest {
    @NotBlank(message = "SERVICE_NAME_REQUIRED")
    String name;

    String description;
    String icon;
    String category;
    String price;
    String image;
}