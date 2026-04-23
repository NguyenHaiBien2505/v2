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
import nhb.vn.be.dto.request.DoctorCreationRequest;
import nhb.vn.be.dto.request.DoctorUpdateRequest;
import nhb.vn.be.dto.response.APIResponse;
import nhb.vn.be.dto.response.DoctorResponse;
import nhb.vn.be.dto.response.PageResponse;
import nhb.vn.be.service.DoctorService;

import java.util.UUID;

@RestController
@RequestMapping("/doctors")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DoctorController {
    DoctorService doctorService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public APIResponse<DoctorResponse> createDoctor(@Valid @RequestBody DoctorCreationRequest request) {
        return APIResponse.<DoctorResponse>builder()
                .result(doctorService.createDoctor(request))
                .build();
    }

    @GetMapping
    public APIResponse<PageResponse<DoctorResponse>> getAllDoctors(
            @PageableDefault(size = 10, sort = "fullName", direction = Sort.Direction.ASC) Pageable pageable) {
        return APIResponse.<PageResponse<DoctorResponse>>builder()
                .result(doctorService.getAllDoctors(pageable))
                .build();
    }

    @GetMapping("/search")
    public APIResponse<PageResponse<DoctorResponse>> searchDoctors(
            @RequestParam(required = false) Long specialtyId,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 10) Pageable pageable) {
        return APIResponse.<PageResponse<DoctorResponse>>builder()
                .result(doctorService.searchDoctors(specialtyId, keyword, pageable))
                .build();
    }

    @GetMapping("/{id}")
    public APIResponse<DoctorResponse> getDoctor(@PathVariable UUID id) {
        return APIResponse.<DoctorResponse>builder()
                .result(doctorService.getDoctor(id))
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public APIResponse<DoctorResponse> updateDoctor(@PathVariable UUID id, @Valid @RequestBody DoctorUpdateRequest request) {
        return APIResponse.<DoctorResponse>builder()
                .result(doctorService.updateDoctor(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public APIResponse<Void> deleteDoctor(@PathVariable UUID id) {
        doctorService.deleteDoctor(id);
        return APIResponse.<Void>builder()
                .message("Doctor deleted successfully")
                .build();
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public APIResponse<DoctorResponse> getDoctorByUserId(@PathVariable UUID userId) {
        return APIResponse.<DoctorResponse>builder()
                .result(doctorService.getDoctorByUserId(userId))
                .build();
    }
}
