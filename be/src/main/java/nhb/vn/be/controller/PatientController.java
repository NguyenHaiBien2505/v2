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
import nhb.vn.be.dto.request.PatientCreationRequest;
import nhb.vn.be.dto.request.PatientUpdateRequest;
import nhb.vn.be.dto.response.APIResponse;
import nhb.vn.be.dto.response.PageResponse;
import nhb.vn.be.dto.response.PatientResponse;
import nhb.vn.be.service.PatientService;

import java.util.UUID;

@RestController
@RequestMapping("/patients")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PatientController {
    PatientService patientService;

    @PostMapping("/register")
    public APIResponse<PatientResponse> registerPatient(@Valid @RequestBody PatientCreationRequest request) {
        return APIResponse.<PatientResponse>builder()
                .result(patientService.createPatient(request))
                .build();
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public APIResponse<PageResponse<PatientResponse>> getAllPatients(
            @PageableDefault(size = 10, sort = "fullName", direction = Sort.Direction.ASC) Pageable pageable) {
        return APIResponse.<PageResponse<PatientResponse>>builder()
                .result(patientService.getAllPatients(pageable))
                .build();
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public APIResponse<PageResponse<PatientResponse>> searchPatients(
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 10) Pageable pageable) {
        return APIResponse.<PageResponse<PatientResponse>>builder()
                .result(patientService.searchPatients(keyword, pageable))
                .build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PATIENT', 'DOCTOR')")
    public APIResponse<PatientResponse> getPatient(@PathVariable UUID id) {
        return APIResponse.<PatientResponse>builder()
                .result(patientService.getPatient(id))
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PATIENT')")
    public APIResponse<PatientResponse> updatePatient(@PathVariable UUID id, @Valid @RequestBody PatientUpdateRequest request) {
        return APIResponse.<PatientResponse>builder()
                .result(patientService.updatePatient(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public APIResponse<Void> deletePatient(@PathVariable UUID id) {
        patientService.deletePatient(id);
        return APIResponse.<Void>builder()
                .message("Patient deleted successfully")
                .build();
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PATIENT', 'DOCTOR')")
    public APIResponse<PatientResponse> getPatientByUserId(@PathVariable UUID userId) {
        return APIResponse.<PatientResponse>builder()
                .result(patientService.getPatientByUserId(userId))
                .build();
    }
}
