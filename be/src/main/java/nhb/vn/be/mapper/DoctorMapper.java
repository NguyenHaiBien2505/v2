package nhb.vn.be.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import nhb.vn.be.dto.request.DoctorCreationRequest;
import nhb.vn.be.dto.request.DoctorUpdateRequest;
import nhb.vn.be.dto.response.DoctorResponse;
import nhb.vn.be.entity.Doctor;

@Mapper(componentModel = "spring", uses = {UserMapper.class, SpecialtyMapper.class})
public interface DoctorMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "specialty", ignore = true)
    Doctor toDoctor(DoctorCreationRequest request);

    @Mapping(source = "specialty", target = "specialty")
    @Mapping(source = "user", target = "user")
    DoctorResponse toDoctorResponse(Doctor doctor);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "specialty", ignore = true)
    void updateDoctor(@MappingTarget Doctor doctor, DoctorUpdateRequest request);
}