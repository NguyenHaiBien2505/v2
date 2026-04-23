package nhb.vn.be.mapper;

import nhb.vn.be.dto.request.UserCreationRequest;
import nhb.vn.be.dto.request.UserUpdateRequest;
import nhb.vn.be.dto.response.UserResponse;
import nhb.vn.be.entity.Role;
import nhb.vn.be.entity.User;
import nhb.vn.be.repository.RoleRepository;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public abstract class UserMapper {

    @Autowired
    protected RoleRepository roleRepository;

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "admin", ignore = true)
    @Mapping(target = "doctor", ignore = true)
    @Mapping(target = "patient", ignore = true)
    public abstract User toUser(UserCreationRequest request);

    @Mapping(source = "roles", target = "roles")
    public abstract UserResponse toUserResponse(User user);

    @Mapping(target = "password", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "admin", ignore = true)
    @Mapping(target = "doctor", ignore = true)
    @Mapping(target = "patient", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "username", ignore = true)
    public abstract void updateUser(@MappingTarget User user, UserUpdateRequest request);

    // Custom mapping: Set<String> -> Set<Role>
    // The DTO sends role IDs as strings; convert to Long and fetch Role.
    protected Set<Role> mapRoles(Set<String> roleIdStrings) {
        if (roleIdStrings == null || roleIdStrings.isEmpty()) {
            return new HashSet<>();
        }

        return roleIdStrings.stream()
                .map(idStr -> {
                    try {
                        Long id = Long.parseLong(idStr);
                        return roleRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Role not found with id: " + id));
                    } catch (NumberFormatException e) {
                        throw new RuntimeException("Invalid role id: " + idStr, e);
                    }
                })
                .collect(Collectors.toSet());
    }

    // Custom mapping: Set<Role> -> Set<String> (return role IDs as strings)
    protected Set<String> mapRolesToStrings(Set<Role> roles) {
        if (roles == null || roles.isEmpty()) {
            return new HashSet<>();
        }

        return roles.stream()
                .map(Role::getId)
                .filter(id -> id != null)
                .map(String::valueOf)
                .collect(Collectors.toSet());
    }
}
