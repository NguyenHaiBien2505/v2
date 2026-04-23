package nhb.vn.be.mapper;


import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import nhb.vn.be.dto.request.PatientCreationRequest;
import nhb.vn.be.dto.request.PatientUpdateRequest;
import nhb.vn.be.dto.response.PatientResponse;
import nhb.vn.be.entity.Patient;

@Mapper(componentModel = "spring", uses = UserMapper.class)
public interface PatientMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "patientCode", ignore = true)
    Patient toPatient(PatientCreationRequest request);

    @Mapping(source = "user", target = "user")
    PatientResponse toPatientResponse(Patient patient);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "patientCode", ignore = true)
    void updatePatient(@MappingTarget Patient patient, PatientUpdateRequest request);
}