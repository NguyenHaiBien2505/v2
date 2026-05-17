package nhb.vn.be.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * Một điểm dữ liệu doanh thu: dùng cho tuần / tháng / năm.
 * Khi dùng với revenueByMonth  → period = số tháng (1-12)
 * Khi dùng với revenueByWeek   → period = số tuần ISO (1-53)
 * Khi dùng với revenueByYear   → period = năm (2024, 2025, …)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RevenuePointDTO {
    Integer period;      // tháng | tuần | năm
    Long    revenue;     // tổng tiền (VNĐ)
    Long    count;       // số giao dịch thành công
}
