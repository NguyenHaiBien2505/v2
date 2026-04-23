package nhb.vn.be.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NewsResponse {
    Long id;
    String title;
    String excerpt;
    String content;
    String image;
    String category;
    String author;
    String authorImage;
    LocalDateTime publishedAt;
    Long views;
    Boolean featured;
}