package nhb.vn.be.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BannerResponse {
    Long id;
    String title;
    String subtitle;
    String imageUrl;
    String linkUrl;
    Integer sortOrder;
    Boolean isActive;
    LocalDateTime createdAt;
}