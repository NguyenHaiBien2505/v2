package nhb.vn.be.repository;

import nhb.vn.be.entity.Payment;
import nhb.vn.be.enums.PaymentTargetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByOrderCode(Long orderCode);

//    boolean existsByTargetTypeAndTargetIdAndStatus(PaymentTargetType targetType, Long targetId, String status);

    // Thêm method này vào PaymentRepository
    boolean existsByTargetTypeAndTargetIdAndStatus(
            PaymentTargetType targetType,
            Long targetId,
            String status);
}