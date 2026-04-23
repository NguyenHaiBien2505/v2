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
import nhb.vn.be.dto.request.MedicalServiceRequest;
import nhb.vn.be.dto.response.APIResponse;
import nhb.vn.be.dto.response.MedicalServiceResponse;
import nhb.vn.be.dto.response.PageResponse;
import nhb.vn.be.service.MedicalServiceService;

@RestController
@RequestMapping("/medical-services")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MedicalServiceController {
    MedicalServiceService medicalServiceService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public APIResponse<MedicalServiceResponse> createMedicalService(@Valid @RequestBody MedicalServiceRequest request) {
        return APIResponse.<MedicalServiceResponse>builder()
                .result(medicalServiceService.createMedicalService(request))
                .build();
    }

    @GetMapping
    public APIResponse<PageResponse<MedicalServiceResponse>> getAllMedicalServices(
            @PageableDefault(size = 10, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        return APIResponse.<PageResponse<MedicalServiceResponse>>builder()
                .result(medicalServiceService.getAllMedicalServices(pageable))
                .build();
    }

    @GetMapping("/category/{category}")
    public APIResponse<PageResponse<MedicalServiceResponse>> getServicesByCategory(
            @PathVariable String category,
            @PageableDefault(size = 10) Pageable pageable) {
        return APIResponse.<PageResponse<MedicalServiceResponse>>builder()
                .result(medicalServiceService.getServicesByCategory(category, pageable))
                .build();
    }

    @GetMapping("/search")
    public APIResponse<PageResponse<MedicalServiceResponse>> searchMedicalServices(
            @RequestParam String name,
            @PageableDefault(size = 10) Pageable pageable) {
        return APIResponse.<PageResponse<MedicalServiceResponse>>builder()
                .result(medicalServiceService.searchMedicalServices(name, pageable))
                .build();
    }

    @GetMapping("/{id}")
    public APIResponse<MedicalServiceResponse> getMedicalService(@PathVariable Long id) {
        return APIResponse.<MedicalServiceResponse>builder()
                .result(medicalServiceService.getMedicalService(id))
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public APIResponse<MedicalServiceResponse> updateMedicalService(
            @PathVariable Long id,
            @Valid @RequestBody MedicalServiceRequest request) {
        return APIResponse.<MedicalServiceResponse>builder()
                .result(medicalServiceService.updateMedicalService(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public APIResponse<Void> deleteMedicalService(@PathVariable Long id) {
        medicalServiceService.deleteMedicalService(id);
        return APIResponse.<Void>builder()
                .message("Medical service deleted successfully")
                .build();
    }
}
