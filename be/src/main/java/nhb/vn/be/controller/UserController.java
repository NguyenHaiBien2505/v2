package nhb.vn.be.controller;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import nhb.vn.be.dto.request.UserCreationRequest;
import nhb.vn.be.dto.request.UserUpdateRequest;
import nhb.vn.be.dto.response.APIResponse;
import nhb.vn.be.dto.response.PageResponse;
import nhb.vn.be.dto.response.UserResponse;
import nhb.vn.be.service.UserService;

import java.util.UUID;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {
    UserService userService;

    @PostMapping
    public APIResponse<UserResponse> createUser(@Valid @RequestBody UserCreationRequest request) {
        return APIResponse.<UserResponse>builder()
                .result(userService.createUser(request))
                .build();
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public APIResponse<PageResponse<UserResponse>> getAllUsers(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return APIResponse.<PageResponse<UserResponse>>builder()
                .result(userService.getAllUsers(pageable))
                .build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public APIResponse<UserResponse> getUser(@PathVariable UUID id) {
        return APIResponse.<UserResponse>builder()
                .result(userService.getUser(id))
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public APIResponse<UserResponse> updateUser(@PathVariable UUID id, @Valid @RequestBody UserUpdateRequest request) {
        return APIResponse.<UserResponse>builder()
                .result(userService.updateUser(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public APIResponse<Void> deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
        return APIResponse.<Void>builder()
                .message("User deleted successfully")
                .build();
    }

    @GetMapping("/my-info")
    public APIResponse<UserResponse> getMyInfo() {
        return APIResponse.<UserResponse>builder()
                .result(userService.getMyInfo())
                .build();
    }
}
