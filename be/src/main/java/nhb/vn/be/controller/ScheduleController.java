package nhb.vn.be.controller;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import nhb.vn.be.dto.request.ScheduleRequest;
import nhb.vn.be.dto.response.APIResponse;
import nhb.vn.be.dto.response.PageResponse;
import nhb.vn.be.dto.response.ScheduleResponse;
import nhb.vn.be.service.ScheduleService;

import java.util.UUID;

@RestController
@RequestMapping("/schedules")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ScheduleController {
    ScheduleService scheduleService;

    @PostMapping("/doctors/{doctorId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public APIResponse<ScheduleResponse> createSchedule(
            @PathVariable UUID doctorId,
            @Valid @RequestBody ScheduleRequest request) {
        return APIResponse.<ScheduleResponse>builder()
                .result(scheduleService.createSchedule(doctorId, request))
                .build();
    }

    @GetMapping("/doctors/{doctorId}")
    public APIResponse<PageResponse<ScheduleResponse>> getDoctorSchedules(
            @PathVariable UUID doctorId,
            @PageableDefault(size = 10, sort = "workDate", direction = Sort.Direction.ASC) Pageable pageable) {
        return APIResponse.<PageResponse<ScheduleResponse>>builder()
                .result(scheduleService.getDoctorSchedules(doctorId, pageable))
                .build();
    }

    @GetMapping("/{id}")
    public APIResponse<ScheduleResponse> getSchedule(@PathVariable Long id) {
        return APIResponse.<ScheduleResponse>builder()
                .result(scheduleService.getSchedule(id))
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public APIResponse<ScheduleResponse> updateSchedule(
            @PathVariable Long id,
            @Valid @RequestBody ScheduleRequest request) {
        return APIResponse.<ScheduleResponse>builder()
                .result(scheduleService.updateSchedule(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public APIResponse<Void> deleteSchedule(@PathVariable Long id) {
        scheduleService.deleteSchedule(id);
        return APIResponse.<Void>builder()
                .message("Schedule deleted successfully")
                .build();
    }
}
