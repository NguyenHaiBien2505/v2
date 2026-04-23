package nhb.vn.be.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NewsRequest {
    @NotBlank(message = "TITLE_REQUIRED")
    String title;

    String excerpt;
    String content;
    String image;
    String category;
    String author;
    String authorImage;
    LocalDateTime publishedAt;
    Boolean featured;
}