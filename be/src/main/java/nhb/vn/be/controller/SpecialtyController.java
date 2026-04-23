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
import nhb.vn.be.dto.request.SpecialtyRequest;
import nhb.vn.be.dto.response.APIResponse;
import nhb.vn.be.dto.response.PageResponse;
import nhb.vn.be.dto.response.SpecialtyResponse;
import nhb.vn.be.service.SpecialtyService;

import java.util.List;

@RestController
@RequestMapping("/specialties")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SpecialtyController {
    SpecialtyService specialtyService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public APIResponse<SpecialtyResponse> createSpecialty(@Valid @RequestBody SpecialtyRequest request) {
        return APIResponse.<SpecialtyResponse>builder()
                .result(specialtyService.createSpecialty(request))
                .build();
    }

    @GetMapping
    public APIResponse<PageResponse<SpecialtyResponse>> getAllSpecialties(
            @PageableDefault(size = 10, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        return APIResponse.<PageResponse<SpecialtyResponse>>builder()
                .result(specialtyService.getAllSpecialties(pageable))
                .build();
    }

    @GetMapping("/list")
    public APIResponse<List<SpecialtyResponse>> getAllSpecialtiesList() {
        return APIResponse.<List<SpecialtyResponse>>builder()
                .result(specialtyService.getAllSpecialtiesList())
                .build();
    }

    @GetMapping("/search")
    public APIResponse<PageResponse<SpecialtyResponse>> searchSpecialties(
            @RequestParam String name,
            @PageableDefault(size = 10) Pageable pageable) {
        return APIResponse.<PageResponse<SpecialtyResponse>>builder()
                .result(specialtyService.searchSpecialties(name, pageable))
                .build();
    }

    @GetMapping("/{id}")
    public APIResponse<SpecialtyResponse> getSpecialty(@PathVariable Long id) {
        return APIResponse.<SpecialtyResponse>builder()
                .result(specialtyService.getSpecialty(id))
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public APIResponse<SpecialtyResponse> updateSpecialty(@PathVariable Long id, @Valid @RequestBody SpecialtyRequest request) {
        return APIResponse.<SpecialtyResponse>builder()
                .result(specialtyService.updateSpecialty(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public APIResponse<Void> deleteSpecialty(@PathVariable Long id) {
        specialtyService.deleteSpecialty(id);
        return APIResponse.<Void>builder()
                .message("Specialty deleted successfully")
                .build();
    }
}