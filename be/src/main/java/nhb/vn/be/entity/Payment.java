package nhb.vn.be.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import nhb.vn.be.enums.PaymentTargetType;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    // Mã đơn hàng gửi lên PayOS - phải unique
    @Column(unique = true, nullable = false)
    Long orderCode;

    Long amount;

    String description;

    // PENDING | PAID | CANCELLED | FAILED
    @Column(length = 20)
    String status;

    // APPOINTMENT | MEDICAL_SERVICE
    @Column(length = 50, nullable = false)
    @Enumerated(EnumType.STRING)
    PaymentTargetType targetType;

    // ID của Appointment hoặc MedicalService
    @Column(nullable = false)
    Long targetId;

    @Column(columnDefinition = "TEXT")
    String checkoutUrl;

    @Column(columnDefinition = "TEXT")
    String qrCode;

    // PayOS trả về sau khi thanh toán thành công
    String payosTransactionId;

    LocalDateTime createdAt;
    LocalDateTime paidAt;
}