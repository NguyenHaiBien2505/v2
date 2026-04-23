package nhb.vn.be.controller;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import nhb.vn.be.dto.request.PrescriptionRequest;
import nhb.vn.be.dto.response.APIResponse;
import nhb.vn.be.dto.response.PrescriptionResponse;
import nhb.vn.be.service.PrescriptionService;

@RestController
@RequestMapping("/prescriptions")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PrescriptionController {
    PrescriptionService prescriptionService;

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public APIResponse<PrescriptionResponse> createPrescription(@Valid @RequestBody PrescriptionRequest request) {
        return APIResponse.<PrescriptionResponse>builder()
                .result(prescriptionService.createPrescription(request))
                .build();
    }

    @GetMapping("/appointment/{appointmentId}")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
    public APIResponse<PrescriptionResponse> getPrescriptionByAppointment(@PathVariable Long appointmentId) {
        return APIResponse.<PrescriptionResponse>builder()
                .result(prescriptionService.getPrescriptionByAppointment(appointmentId))
                .build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
    public APIResponse<PrescriptionResponse> getPrescription(@PathVariable Long id) {
        return APIResponse.<PrescriptionResponse>builder()
                .result(prescriptionService.getPrescription(id))
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('DOCTOR')")
    public APIResponse<PrescriptionResponse> updatePrescription(
            @PathVariable Long id,
            @Valid @RequestBody PrescriptionRequest request) {
        return APIResponse.<PrescriptionResponse>builder()
                .result(prescriptionService.updatePrescription(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('DOCTOR')")
    public APIResponse<Void> deletePrescription(@PathVariable Long id) {
        prescriptionService.deletePrescription(id);
        return APIResponse.<Void>builder()
                .message("Prescription deleted successfully")
                .build();
    }
}