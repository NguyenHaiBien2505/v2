package nhb.vn.be.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import nhb.vn.be.dto.request.MedicalServiceRequest;
import nhb.vn.be.dto.response.MedicalServiceResponse;
import nhb.vn.be.entity.MedicalService;

import java.time.LocalDateTime;

@Mapper(componentModel = "spring")
public interface MedicalServiceMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    MedicalService toMedicalService(MedicalServiceRequest request);

    MedicalServiceResponse toMedicalServiceResponse(MedicalService medicalService);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", expression = "java(java.time.LocalDateTime.now())")
    void updateMedicalService(@MappingTarget MedicalService medicalService, MedicalServiceRequest request);
}