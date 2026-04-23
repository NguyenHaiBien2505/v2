package nhb.vn.be.mapper;



import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import nhb.vn.be.dto.request.SpecialtyRequest;
import nhb.vn.be.dto.response.SpecialtyResponse;
import nhb.vn.be.entity.Specialty;

@Mapper(componentModel = "spring")
public interface SpecialtyMapper {
    Specialty toSpecialty(SpecialtyRequest request);

    @Mapping(target = "doctors", ignore = true)
    SpecialtyResponse toSpecialtyResponse(Specialty specialty);

    void updateSpecialty(@MappingTarget Specialty specialty, SpecialtyRequest request);
}