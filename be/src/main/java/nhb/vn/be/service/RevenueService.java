package nhb.vn.be.service;

import lombok.RequiredArgsConstructor;
import nhb.vn.be.dto.response.RevenuePointDTO;
import nhb.vn.be.dto.response.RevenueReportDTO;
import nhb.vn.be.repository.PaymentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoField;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RevenueService {

    private final PaymentRepository paymentRepository;

    /**
     * Thống kê doanh thu theo tháng trong 1 năm.
     * Trả về 12 điểm dữ liệu (tháng 1-12).
     */
    public RevenueReportDTO getMonthlyRevenue(int year) {
        List<RevenuePointDTO> raw = paymentRepository.revenueByMonth(year);

        // Đảm bảo đủ 12 tháng (tháng không có data = 0)
        List<RevenuePointDTO> full = buildFull(raw, 1, 12);

        long totalRevenue = full.stream().mapToLong(RevenuePointDTO::getRevenue).sum();
        long totalTx      = full.stream().mapToLong(RevenuePointDTO::getCount).sum();

        return RevenueReportDTO.builder()
                .totalRevenue(totalRevenue)
                .totalTransactions(totalTx)
                .data(full)
                .year(year)
                .mode("MONTH")
                .build();
    }

    /**
     * Thống kê doanh thu theo tuần của một tháng cụ thể.
     * Trả về các tuần trong tháng (thường là 1-5).
     */
    public RevenueReportDTO getWeeklyRevenue(int year, int month) {
        if (month <= 0) month = LocalDateTime.now().getMonthValue();

        List<nhb.vn.be.entity.Payment> payments = paymentRepository.findAllPaidByYearAndMonth(year, month);

        Map<Integer, List<nhb.vn.be.entity.Payment>> byWeek = payments.stream().collect(Collectors.groupingBy(p -> 
            p.getPaidAt().get(ChronoField.ALIGNED_WEEK_OF_MONTH)
        ));

        List<RevenuePointDTO> raw = new ArrayList<>();
        for (Map.Entry<Integer, List<nhb.vn.be.entity.Payment>> entry : byWeek.entrySet()) {
            long rev = entry.getValue().stream().mapToLong(nhb.vn.be.entity.Payment::getAmount).sum();
            long count = entry.getValue().size();
            raw.add(new RevenuePointDTO(entry.getKey(), rev, count));
        }

        List<RevenuePointDTO> full = buildFull(raw, 1, 5);

        long totalRevenue = full.stream().mapToLong(RevenuePointDTO::getRevenue).sum();
        long totalTx      = full.stream().mapToLong(RevenuePointDTO::getCount).sum();

        return RevenueReportDTO.builder()
                .totalRevenue(totalRevenue)
                .totalTransactions(totalTx)
                .data(full)
                .year(year)
                .mode("WEEK")
                .build();
    }

    /**
     * Thống kê doanh thu theo ngày của một tháng cụ thể.
     */
    public RevenueReportDTO getDailyRevenue(int year, int month) {
        if (month <= 0) month = LocalDateTime.now().getMonthValue();
        if (year <= 0) year = LocalDateTime.now().getYear();

        List<nhb.vn.be.entity.Payment> payments = paymentRepository.findAllPaidByYearAndMonth(year, month);

        Map<Integer, List<nhb.vn.be.entity.Payment>> byDay = payments.stream().collect(Collectors.groupingBy(p -> 
            p.getPaidAt().getDayOfMonth()
        ));

        int daysInMonth = java.time.YearMonth.of(year, month).lengthOfMonth();

        List<RevenuePointDTO> raw = new ArrayList<>();
        for (Map.Entry<Integer, List<nhb.vn.be.entity.Payment>> entry : byDay.entrySet()) {
            long rev = entry.getValue().stream().mapToLong(nhb.vn.be.entity.Payment::getAmount).sum();
            long count = entry.getValue().size();
            raw.add(new RevenuePointDTO(entry.getKey(), rev, count));
        }

        List<RevenuePointDTO> full = buildFull(raw, 1, daysInMonth);

        long totalRevenue = full.stream().mapToLong(RevenuePointDTO::getRevenue).sum();
        long totalTx      = full.stream().mapToLong(RevenuePointDTO::getCount).sum();

        return RevenueReportDTO.builder()
                .totalRevenue(totalRevenue)
                .totalTransactions(totalTx)
                .data(full)
                .year(year)
                .mode("DAY")
                .build();
    }

    /**
     * Thống kê doanh thu theo từng năm (toàn bộ lịch sử).
     */
    public RevenueReportDTO getYearlyRevenue() {
        List<RevenuePointDTO> raw = paymentRepository.revenueByYear();
        
        int currentYear = LocalDateTime.now().getYear();
        int minYear = raw.stream()
            .filter(r -> r.getPeriod() != null)
            .mapToInt(RevenuePointDTO::getPeriod)
            .min()
            .orElse(currentYear - 4);
        int startYear = Math.min(minYear, currentYear - 4);

        List<RevenuePointDTO> full = buildFull(raw, startYear, currentYear);

        long totalRevenue = full.stream().mapToLong(RevenuePointDTO::getRevenue).sum();
        long totalTx      = full.stream().mapToLong(RevenuePointDTO::getCount).sum();

        return RevenueReportDTO.builder()
                .totalRevenue(totalRevenue)
                .totalTransactions(totalTx)
                .data(full)
                .year(null)
                .mode("YEAR")
                .build();
    }

    /**
     * Tổng doanh thu toàn thời gian.
     */
    public long getTotalRevenue() {
        return paymentRepository.sumTotalRevenue();
    }

    // ── helper: điền 0 vào các kỳ không có dữ liệu ──────────────────────
    private List<RevenuePointDTO> buildFull(
            List<RevenuePointDTO> raw, int from, int to) {

        return java.util.stream.IntStream.rangeClosed(from, to)
                .mapToObj(period -> raw.stream()
                        .filter(r -> r.getPeriod() != null && r.getPeriod() == period)
                        .findFirst()
                        .orElse(new RevenuePointDTO(period, 0L, 0L)))
                .toList();
    }
}
