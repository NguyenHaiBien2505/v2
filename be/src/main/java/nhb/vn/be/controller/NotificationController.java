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
import nhb.vn.be.dto.request.NotificationRequest;
import nhb.vn.be.dto.response.APIResponse;
import nhb.vn.be.dto.response.NotificationResponse;
import nhb.vn.be.dto.response.PageResponse;
import nhb.vn.be.service.NotificationService;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationController {
    NotificationService notificationService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public APIResponse<NotificationResponse> createNotification(@Valid @RequestBody NotificationRequest request) {
        return APIResponse.<NotificationResponse>builder()
                .result(notificationService.createNotification(request))
                .build();
    }

    @GetMapping("/patients/{patientId}")
    @PreAuthorize("hasAnyRole('PATIENT', 'ADMIN')")
    public APIResponse<PageResponse<NotificationResponse>> getPatientNotifications(
            @PathVariable String patientId,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return APIResponse.<PageResponse<NotificationResponse>>builder()
                .result(notificationService.getPatientNotifications(patientId, pageable))
                .build();
    }

    @GetMapping("/patients/{patientId}/unread")
    @PreAuthorize("hasAnyRole('PATIENT', 'ADMIN')")
    public APIResponse<PageResponse<NotificationResponse>> getUnreadNotifications(
            @PathVariable String patientId,
            @PageableDefault(size = 10) Pageable pageable) {
        return APIResponse.<PageResponse<NotificationResponse>>builder()
                .result(notificationService.getUnreadNotifications(patientId, pageable))
                .build();
    }

    @GetMapping("/patients/{patientId}/count-unread")
    @PreAuthorize("hasAnyRole('PATIENT', 'ADMIN')")
    public APIResponse<Long> countUnreadNotifications(@PathVariable String patientId) {
        return APIResponse.<Long>builder()
                .result(notificationService.countUnreadNotifications(patientId))
                .build();
    }

    @PatchMapping("/{id}/read")
    @PreAuthorize("hasAnyRole('PATIENT', 'ADMIN')")
    public APIResponse<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return APIResponse.<Void>builder()
                .message("Notification marked as read")
                .build();
    }

    @PatchMapping("/patients/{patientId}/read-all")
    @PreAuthorize("hasAnyRole('PATIENT', 'ADMIN')")
    public APIResponse<Void> markAllAsRead(@PathVariable String patientId) {
        notificationService.markAllAsRead(patientId);
        return APIResponse.<Void>builder()
                .message("All notifications marked as read")
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public APIResponse<Void> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return APIResponse.<Void>builder()
                .message("Notification deleted successfully")
                .build();
    }
}