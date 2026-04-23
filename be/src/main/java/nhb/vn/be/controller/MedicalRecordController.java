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
import nhb.vn.be.dto.request.MedicalRecordRequest;
import nhb.vn.be.dto.response.APIResponse;
import nhb.vn.be.dto.response.MedicalRecordResponse;
import nhb.vn.be.dto.response.PageResponse;
import nhb.vn.be.service.MedicalRecordService;

import java.util.UUID;

@RestController
@RequestMapping("/medical-records")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MedicalRecordController {
    MedicalRecordService medicalRecordService;

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public APIResponse<MedicalRecordResponse> createMedicalRecord(@Valid @RequestBody MedicalRecordRequest request) {
        return APIResponse.<MedicalRecordResponse>builder()
                .result(medicalRecordService.createMedicalRecord(request))
                .build();
    }

    @GetMapping("/patients/{patientId}")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
    public APIResponse<PageResponse<MedicalRecordResponse>> getPatientMedicalRecords(
            @PathVariable UUID patientId,
            @PageableDefault(size = 10, sort = "date", direction = Sort.Direction.DESC) Pageable pageable) {
        return APIResponse.<PageResponse<MedicalRecordResponse>>builder()
                .result(medicalRecordService.getPatientMedicalRecords(patientId, pageable))
                .build();
    }

    @GetMapping("/doctors/{doctorId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public APIResponse<PageResponse<MedicalRecordResponse>> getDoctorMedicalRecords(
            @PathVariable UUID doctorId,
            @PageableDefault(size = 10, sort = "date", direction = Sort.Direction.DESC) Pageable pageable) {
        return APIResponse.<PageResponse<MedicalRecordResponse>>builder()
                .result(medicalRecordService.getDoctorMedicalRecords(doctorId, pageable))
                .build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
    public APIResponse<MedicalRecordResponse> getMedicalRecord(@PathVariable Long id) {
        return APIResponse.<MedicalRecordResponse>builder()
                .result(medicalRecordService.getMedicalRecord(id))
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('DOCTOR')")
    public APIResponse<MedicalRecordResponse> updateMedicalRecord(
            @PathVariable Long id,
            @Valid @RequestBody MedicalRecordRequest request) {
        return APIResponse.<MedicalRecordResponse>builder()
                .result(medicalRecordService.updateMedicalRecord(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('DOCTOR')")
    public APIResponse<Void> deleteMedicalRecord(@PathVariable Long id) {
        medicalRecordService.deleteMedicalRecord(id);
        return APIResponse.<Void>builder()
                .message("Medical record deleted successfully")
                .build();
    }
}