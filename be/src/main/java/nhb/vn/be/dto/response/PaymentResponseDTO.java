// -------- PaymentResponseDTO.java --------
package nhb.vn.be.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentResponseDTO {
    Long orderCode;
    Long amount;
    String description;
    String status;
    String qrCode;
    String checkoutUrl;
}