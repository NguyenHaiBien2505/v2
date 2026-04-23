package nhb.vn.be.mapper;


import nhb.vn.be.dto.response.RoleResponse;
import nhb.vn.be.entity.Role;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    RoleResponse toRoleResponse(Role role);
}
