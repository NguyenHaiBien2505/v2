package nhb.vn.be.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import nhb.vn.be.dto.request.PrescriptionRequest;
import nhb.vn.be.dto.response.PrescriptionResponse;
import nhb.vn.be.entity.Appointment;
import nhb.vn.be.entity.Prescription;
import nhb.vn.be.entity.PrescriptionDetail;
import nhb.vn.be.exception.AppException;
import nhb.vn.be.exception.ErrorCode;
import nhb.vn.be.mapper.PrescriptionMapper;
import nhb.vn.be.repository.AppointmentRepository;
import nhb.vn.be.repository.PrescriptionRepository;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PrescriptionService {
    PrescriptionRepository prescriptionRepository;
    AppointmentRepository appointmentRepository;
    PrescriptionMapper prescriptionMapper;

    @Transactional
    public PrescriptionResponse createPrescription(PrescriptionRequest request) {
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new AppException(ErrorCode.APPOINTMENT_NOT_EXISTED));

        if (prescriptionRepository.findByAppointmentId(request.getAppointmentId()).isPresent()) {
            throw new AppException(ErrorCode.DATA_INTEGRITY_VIOLATION, "Prescription already exists for this appointment");
        }

        Prescription prescription = prescriptionMapper.toPrescription(request);
        prescription.setAppointment(appointment);

        // Sử dụng vòng lặp for thay vì lambda
        if (request.getDetails() != null && !request.getDetails().isEmpty()) {
            Set<PrescriptionDetail> details = new HashSet<>();
            for (var detailRequest : request.getDetails()) {
                PrescriptionDetail detail = prescriptionMapper.toPrescriptionDetail(detailRequest);
                detail.setPrescription(prescription);
                details.add(detail);
            }
            prescription.setDetails(details);
        }

        prescription = prescriptionRepository.save(prescription);

        return prescriptionMapper.toPrescriptionResponse(prescription);
    }

    public PrescriptionResponse getPrescriptionByAppointment(Long appointmentId) {
        Prescription prescription = prescriptionRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new AppException(ErrorCode.PRESCRIPTION_NOT_EXISTED));
        return prescriptionMapper.toPrescriptionResponse(prescription);
    }

    public PrescriptionResponse getPrescription(Long id) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRESCRIPTION_NOT_EXISTED));
        return prescriptionMapper.toPrescriptionResponse(prescription);
    }

    @Transactional
    public PrescriptionResponse updatePrescription(Long id, PrescriptionRequest request) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRESCRIPTION_NOT_EXISTED));

        prescription.setDiagnosis(request.getDiagnosis());
        prescription.setNotes(request.getNotes());

        // Clear and re-add details - Cách fix 3: Sử dụng vòng lặp for đơn giản
        prescription.getDetails().clear();

        if (request.getDetails() != null) {
            for (var detailRequest : request.getDetails()) {
                PrescriptionDetail detail = prescriptionMapper.toPrescriptionDetail(detailRequest);
                detail.setPrescription(prescription);
                prescription.getDetails().add(detail);
            }
        }

        prescription = prescriptionRepository.save(prescription);

        return prescriptionMapper.toPrescriptionResponse(prescription);
    }

    public void deletePrescription(Long id) {
        if (!prescriptionRepository.existsById(id)) {
            throw new AppException(ErrorCode.PRESCRIPTION_NOT_EXISTED);
        }
        prescriptionRepository.deleteById(id);
    }
}