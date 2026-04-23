package nhb.vn.be.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationRequest {
    @NotBlank(message = "TYPE_REQUIRED")
    String type;

    @NotBlank(message = "TITLE_REQUIRED")
    String title;

    String message;
    String patientId;
}

