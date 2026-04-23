package nhb.vn.be.dto.response;


import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Collections;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PageResponse<T> {
    @Builder.Default
    List<T> content = Collections.emptyList();
    int pageNumber;
    int pageSize;
    long totalElements;
    int totalPages;
    boolean first;
    boolean last;
}
