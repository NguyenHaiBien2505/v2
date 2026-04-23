package nhb.vn.be.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BannerRequest {
    @NotBlank(message = "TITLE_REQUIRED")
    String title;

    String subtitle;
    String imageUrl;
    String linkUrl;
    Integer sortOrder;
    Boolean isActive;
}
