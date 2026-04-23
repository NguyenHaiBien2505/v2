package nhb.vn.be.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
// Field nao null thi khong hien thi
@JsonInclude(JsonInclude.Include.NON_NULL)
public class APIResponse<T> {
    private int code = 1000;
    private String message;
    private T result;
}
