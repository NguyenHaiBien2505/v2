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
import nhb.vn.be.dto.request.AppointmentRequest;
import nhb.vn.be.dto.response.APIResponse;
import nhb.vn.be.dto.response.AppointmentResponse;
import nhb.vn.be.dto.response.PageResponse;
import nhb.vn.be.service.AppointmentService;

import java.util.UUID;

@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AppointmentController {
    AppointmentService appointmentService;

    @PostMapping("/patients/{patientId}/doctors/{doctorId}")
    @PreAuthorize("hasAnyRole('PATIENT', 'ADMIN')")
    public APIResponse<AppointmentResponse> createAppointment(
            @PathVariable UUID patientId,
            @PathVariable UUID doctorId,
            @Valid @RequestBody AppointmentRequest request) {
        return APIResponse.<AppointmentResponse>builder()
                .result(appointmentService.createAppointment(patientId, doctorId, request))
                .build();
    }

    @GetMapping("/patients/{patientId}")
    @PreAuthorize("hasAnyRole('PATIENT', 'ADMIN', 'DOCTOR')")
    public APIResponse<PageResponse<AppointmentResponse>> getPatientAppointments(
            @PathVariable UUID patientId,
            @PageableDefault(size = 10, sort = "appointmentDate", direction = Sort.Direction.DESC) Pageable pageable) {
        return APIResponse.<PageResponse<AppointmentResponse>>builder()
                .result(appointmentService.getPatientAppointments(patientId, pageable))
                .build();
    }

    @GetMapping("/doctors/{doctorId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public APIResponse<PageResponse<AppointmentResponse>> getDoctorAppointments(
            @PathVariable UUID doctorId,
            @PageableDefault(size = 10, sort = "appointmentDate", direction = Sort.Direction.ASC) Pageable pageable) {
        return APIResponse.<PageResponse<AppointmentResponse>>builder()
                .result(appointmentService.getDoctorAppointments(doctorId, pageable))
                .build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
    public APIResponse<AppointmentResponse> getAppointment(@PathVariable Long id) {
        return APIResponse.<AppointmentResponse>builder()
                .result(appointmentService.getAppointment(id))
                .build();
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public APIResponse<AppointmentResponse> updateAppointmentStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return APIResponse.<AppointmentResponse>builder()
                .result(appointmentService.updateAppointmentStatus(id, status))
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('PATIENT', 'ADMIN')")
    public APIResponse<Void> cancelAppointment(@PathVariable Long id) {
        appointmentService.cancelAppointment(id);
        return APIResponse.<Void>builder()
                .message("Appointment cancelled successfully")
                .build();
    }
}