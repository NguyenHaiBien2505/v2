package nhb.vn.be.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SpecialtyRequest {
    @NotBlank(message = "SPECIALTY_NAME_REQUIRED")
    String name;

    String icon;
    String description;
}
