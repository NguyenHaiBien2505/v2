package nhb.vn.be.controller;

import lombok.RequiredArgsConstructor;
import nhb.vn.be.dto.response.APIResponse;
import nhb.vn.be.dto.response.RevenueReportDTO;
import nhb.vn.be.service.RevenueService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

/**
 * Endpoint thống kê doanh thu – chỉ ADMIN được truy cập.
 *
 * GET /revenue/monthly?year=2026
 * GET /revenue/weekly?year=2026
 * GET /revenue/yearly
 * GET /revenue/total
 */
@RestController
@RequestMapping("/revenue")
@RequiredArgsConstructor
public class RevenueController {

    private final RevenueService revenueService;

    private int currentYear() {
        return LocalDateTime.now().getYear();
    }

    /** Thống kê doanh thu theo tháng */
    @GetMapping("/monthly")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<APIResponse<RevenueReportDTO>> monthly(
            @RequestParam(defaultValue = "0") int year) {
        int y = (year <= 0) ? currentYear() : year;
        APIResponse<RevenueReportDTO> resp = new APIResponse<>();
        resp.setResult(revenueService.getMonthlyRevenue(y));
        return ResponseEntity.ok(resp);
    }

    /** Thống kê doanh thu theo tuần (của một tháng) */
    @GetMapping("/weekly")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<APIResponse<RevenueReportDTO>> weekly(
            @RequestParam(defaultValue = "0") int year,
            @RequestParam(defaultValue = "0") int month) {
        int y = (year <= 0) ? currentYear() : year;
        APIResponse<RevenueReportDTO> resp = new APIResponse<>();
        resp.setResult(revenueService.getWeeklyRevenue(y, month));
        return ResponseEntity.ok(resp);
    }

    /** Thống kê doanh thu theo ngày (của một tháng) */
    @GetMapping("/daily")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<APIResponse<RevenueReportDTO>> daily(
            @RequestParam(defaultValue = "0") int year,
            @RequestParam(defaultValue = "0") int month) {
        int y = (year <= 0) ? currentYear() : year;
        APIResponse<RevenueReportDTO> resp = new APIResponse<>();
        resp.setResult(revenueService.getDailyRevenue(y, month));
        return ResponseEntity.ok(resp);
    }

    /** Thống kê doanh thu theo năm (toàn bộ lịch sử) */
    @GetMapping("/yearly")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<APIResponse<RevenueReportDTO>> yearly() {
        APIResponse<RevenueReportDTO> resp = new APIResponse<>();
        resp.setResult(revenueService.getYearlyRevenue());
        return ResponseEntity.ok(resp);
    }

    /** Tổng doanh thu toàn thời gian */
    @GetMapping("/total")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<APIResponse<Long>> total() {
        APIResponse<Long> resp = new APIResponse<>();
        resp.setResult(revenueService.getTotalRevenue());
        return ResponseEntity.ok(resp);
    }
}
