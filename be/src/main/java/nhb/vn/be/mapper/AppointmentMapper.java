package nhb.vn.be.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import nhb.vn.be.dto.request.AppointmentRequest;
import nhb.vn.be.dto.response.AppointmentResponse;
import nhb.vn.be.entity.Appointment;
import org.springframework.stereotype.Component;

@Mapper(componentModel = "spring")
public interface AppointmentMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "endTime", ignore = true)
    @Mapping(target = "notes", ignore = true)
    @Mapping(target = "queueNumber", ignore = true)
    @Mapping(target = "medicalRecord", ignore = true)
    @Mapping(target = "prescription", ignore = true)
    @Mapping(target = "schedule", ignore = true)
    @Mapping(target = "patient", ignore = true)
    @Mapping(target = "doctor", ignore = true)
    Appointment toAppointment(AppointmentRequest request);

    @Mapping(source = "patient.id", target = "patientId")
    @Mapping(source = "patient.fullName", target = "patientName")
    @Mapping(source = "patient.user.avatarUrl", target = "patientAvatar")
    @Mapping(source = "doctor.id", target = "doctorId")
    @Mapping(source = "doctor.fullName", target = "doctorName")
    @Mapping(source = "doctor.avatarUrl", target = "doctorAvatar")
    @Mapping(source = "schedule.id", target = "scheduleId")
    AppointmentResponse toAppointmentResponse(Appointment appointment);
}
