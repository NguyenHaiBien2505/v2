package nhb.vn.be.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import nhb.vn.be.dto.request.ScheduleRequest;
import nhb.vn.be.dto.response.ScheduleResponse;
import nhb.vn.be.entity.Schedule;

@Mapper(componentModel = "spring")
public interface ScheduleMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "doctor", ignore = true)
    @Mapping(target = "appointments", ignore = true)
    Schedule toSchedule(ScheduleRequest request);

    @Mapping(source = "doctor.id", target = "doctorId")
    @Mapping(source = "doctor.fullName", target = "doctorName")
    ScheduleResponse toScheduleResponse(Schedule schedule);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "doctor", ignore = true)
    @Mapping(target = "appointments", ignore = true)
    void updateSchedule(@MappingTarget Schedule schedule, ScheduleRequest request);
}