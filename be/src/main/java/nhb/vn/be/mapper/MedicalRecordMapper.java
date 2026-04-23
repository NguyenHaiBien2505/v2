package nhb.vn.be.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import nhb.vn.be.dto.request.MedicalRecordRequest;
import nhb.vn.be.dto.response.MedicalRecordResponse;
import nhb.vn.be.entity.MedicalRecord;

@Mapper(componentModel = "spring")
public interface MedicalRecordMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "patient", ignore = true)
    @Mapping(target = "doctor", ignore = true)
    @Mapping(target = "appointment", ignore = true)
    MedicalRecord toMedicalRecord(MedicalRecordRequest request);

    @Mapping(source = "patient.id", target = "patientId")
    @Mapping(source = "patient.fullName", target = "patientName")
    @Mapping(source = "doctor.id", target = "doctorId")
    @Mapping(source = "doctor.fullName", target = "doctorName")
    @Mapping(source = "appointment.id", target = "appointmentId")
    MedicalRecordResponse toMedicalRecordResponse(MedicalRecord medicalRecord);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "patient", ignore = true)
    @Mapping(target = "doctor", ignore = true)
    @Mapping(target = "appointment", ignore = true)
    void updateMedicalRecord(@MappingTarget MedicalRecord medicalRecord, MedicalRecordRequest request);
}