package nhb.vn.be.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

/**
 * Kết quả tổng hợp doanh thu trả về cho admin dashboard.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RevenueReportDTO {

    /** Tổng doanh thu toàn thời gian (VNĐ) */
    Long totalRevenue;

    /** Số giao dịch đã thanh toán trong kỳ */
    Long totalTransactions;

    /** Danh sách điểm dữ liệu theo kỳ (tuần/tháng/năm) */
    List<RevenuePointDTO> data;

    /** Năm được truy vấn (null nếu mode = year) */
    Integer year;

    /** Chế độ: WEEK | MONTH | YEAR */
    String mode;
}
