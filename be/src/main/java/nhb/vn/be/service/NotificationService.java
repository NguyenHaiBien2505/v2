package nhb.vn.be.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import nhb.vn.be.dto.request.NotificationRequest;
import nhb.vn.be.dto.response.NotificationResponse;
import nhb.vn.be.dto.response.PageResponse;
import nhb.vn.be.entity.NotificationEntity;
import nhb.vn.be.exception.AppException;
import nhb.vn.be.exception.ErrorCode;
import nhb.vn.be.mapper.NotificationMapper;
import nhb.vn.be.repository.NotificationRepository;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationService {
    NotificationRepository notificationRepository;
    NotificationMapper notificationMapper;

    public NotificationResponse createNotification(NotificationRequest request) {
        NotificationEntity notification = notificationMapper.toNotificationEntity(request);
        notification = notificationRepository.save(notification);
        return notificationMapper.toNotificationResponse(notification);
    }

    public PageResponse<NotificationResponse> getPatientNotifications(String patientId, Pageable pageable) {
        Page<NotificationEntity> notifications = notificationRepository.findByPatientIdOrderByCreatedAtDesc(patientId, pageable);
        return buildPageResponse(notifications.map(notificationMapper::toNotificationResponse));
    }

    public PageResponse<NotificationResponse> getUnreadNotifications(String patientId, Pageable pageable) {
        Page<NotificationEntity> notifications = notificationRepository.findByPatientIdAndIsReadFalse(patientId, pageable);
        return buildPageResponse(notifications.map(notificationMapper::toNotificationResponse));
    }

    @Transactional
    public void markAsRead(Long id) {
        NotificationEntity notification = notificationRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.DATA_INTEGRITY_VIOLATION, "Notification not found"));
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(String patientId) {
        notificationRepository.markAllAsRead(patientId);
    }

    public long countUnreadNotifications(String patientId) {
        return notificationRepository.findByPatientIdAndIsReadFalse(patientId, Pageable.unpaged()).getTotalElements();
    }

    public void deleteNotification(Long id) {
        if (!notificationRepository.existsById(id)) {
            throw new AppException(ErrorCode.DATA_INTEGRITY_VIOLATION, "Notification not found");
        }
        notificationRepository.deleteById(id);
    }

    private PageResponse<NotificationResponse> buildPageResponse(Page<NotificationResponse> page) {
        return PageResponse.<NotificationResponse>builder()
                .content(page.getContent())
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }
}