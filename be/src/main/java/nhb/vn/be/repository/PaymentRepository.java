package nhb.vn.be.repository;

import nhb.vn.be.dto.response.RevenuePointDTO;
import nhb.vn.be.entity.Payment;
import nhb.vn.be.enums.PaymentTargetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByOrderCode(Long orderCode);

    boolean existsByTargetTypeAndTargetIdAndStatus(
            PaymentTargetType targetType,
            Long targetId,
            String status);

    Optional<Payment> findByTargetTypeAndTargetId(PaymentTargetType targetType, Long targetId);

    // ── Tổng doanh thu tất cả thời gian ──────────────────────────────────
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = 'PAID'")
    Long sumTotalRevenue();

    // ── Doanh thu theo tháng trong 1 năm ─────────────────────────────────
    @Query("""
            SELECT new nhb.vn.be.dto.response.RevenuePointDTO(
                MONTH(p.paidAt),
                COALESCE(SUM(p.amount), 0),
                COUNT(p)
            )
            FROM Payment p
            WHERE p.status = 'PAID'
              AND YEAR(p.paidAt) = :year
            GROUP BY MONTH(p.paidAt)
            ORDER BY MONTH(p.paidAt)
            """)
    List<RevenuePointDTO> revenueByMonth(@Param("year") int year);

    // ── Doanh thu theo tuần trong 1 năm ──────────────────────────────────
    @Query("""
            SELECT new nhb.vn.be.dto.response.RevenuePointDTO(
                WEEK(p.paidAt),
                COALESCE(SUM(p.amount), 0),
                COUNT(p)
            )
            FROM Payment p
            WHERE p.status = 'PAID'
              AND YEAR(p.paidAt) = :year
            GROUP BY WEEK(p.paidAt)
            ORDER BY WEEK(p.paidAt)
            """)
    List<RevenuePointDTO> revenueByWeek(@Param("year") int year);

    // ── Doanh thu theo năm (tất cả năm) ──────────────────────────────────
    @Query("""
            SELECT new nhb.vn.be.dto.response.RevenuePointDTO(
                YEAR(p.paidAt),
                COALESCE(SUM(p.amount), 0),
                COUNT(p)
            )
            FROM Payment p
            WHERE p.status = 'PAID'
            GROUP BY YEAR(p.paidAt)
            ORDER BY YEAR(p.paidAt)
            """)
    List<RevenuePointDTO> revenueByYear();

    // ── Danh sách payment đã PAID ─────────────────────────────────────────
    @Query("SELECT p FROM Payment p WHERE p.status = 'PAID' ORDER BY p.paidAt DESC")
    List<Payment> findAllPaid();

    @Query("SELECT p FROM Payment p WHERE p.status = 'PAID' AND YEAR(p.paidAt) = :year AND MONTH(p.paidAt) = :month")
    List<Payment> findAllPaidByYearAndMonth(@Param("year") int year, @Param("month") int month);
}