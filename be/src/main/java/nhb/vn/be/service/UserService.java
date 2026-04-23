package nhb.vn.be.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import nhb.vn.be.dto.request.UserCreationRequest;
import nhb.vn.be.dto.request.UserUpdateRequest;
import nhb.vn.be.dto.response.PageResponse;
import nhb.vn.be.dto.response.UserResponse;
import nhb.vn.be.entity.Role;
import nhb.vn.be.entity.User;
import nhb.vn.be.exception.AppException;
import nhb.vn.be.exception.ErrorCode;
import nhb.vn.be.mapper.UserMapper;
import nhb.vn.be.repository.RoleRepository;
import nhb.vn.be.repository.UserRepository;

import java.util.HashSet;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserService {
    PasswordEncoder passwordEncoder;
    UserRepository userRepository;
    RoleRepository roleRepository;
    UserMapper userMapper;

    public UserResponse createUser(UserCreationRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        User user = userMapper.toUser(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        HashSet<Role> roles = new HashSet<>();
        Role defaultRole = roleRepository.findByRoleName("PATIENT")
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));
        roles.add(defaultRole);

        if (request.getRoles() != null) {
            request.getRoles().forEach(roleId -> {
                Role role = roleRepository.findById(Long.valueOf(roleId))
                        .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));
                roles.add(role);
            });
        }
        user.setRoles(roles);

        try {
            user = userRepository.save(user);
        } catch (DataIntegrityViolationException e) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        return userMapper.toUserResponse(user);
    }

    public PageResponse<UserResponse> getAllUsers(Pageable pageable) {
        Page<User> users = userRepository.findAll(pageable);
        return buildPageResponse(users.map(userMapper::toUserResponse));
    }

    public UserResponse getUser(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return userMapper.toUserResponse(user);
    }

    public UserResponse updateUser(UUID id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        userMapper.updateUser(user, request);

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getRoles() != null) {
            HashSet<Role> roles = new HashSet<>();
            request.getRoles().forEach(roleId -> {
                Role role = roleRepository.findById(Long.valueOf(roleId))
                        .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));
                roles.add(role);
            });
            user.setRoles(roles);
        }

        user = userRepository.save(user);
        return userMapper.toUserResponse(user);
    }

    public void deleteUser(UUID id) {
        if (!userRepository.existsById(id)) {
            throw new AppException(ErrorCode.USER_NOT_EXISTED);
        }
        userRepository.deleteById(id);
    }

    public UserResponse getMyInfo() {
        var context = SecurityContextHolder.getContext();
        String username = context.getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return userMapper.toUserResponse(user);
    }

    private PageResponse<UserResponse> buildPageResponse(Page<UserResponse> page) {
        return PageResponse.<UserResponse>builder()
                .content(page.getContent())
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }
}
