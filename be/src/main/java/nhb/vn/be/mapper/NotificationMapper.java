package nhb.vn.be.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import nhb.vn.be.dto.request.NotificationRequest;
import nhb.vn.be.dto.response.NotificationResponse;
import nhb.vn.be.entity.NotificationEntity;

@Mapper(componentModel = "spring")
public interface NotificationMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isRead", constant = "false")
    @Mapping(target = "createdAt", ignore = true)
    NotificationEntity toNotificationEntity(NotificationRequest request);

    NotificationResponse toNotificationResponse(NotificationEntity notificationEntity);
}