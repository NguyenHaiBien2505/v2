package nhb.vn.be.service;

import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import nhb.vn.be.dto.request.MedicalRecordRequest;
import nhb.vn.be.dto.response.MedicalRecordResponse;
import nhb.vn.be.dto.response.PageResponse;
import nhb.vn.be.entity.Appointment;
import nhb.vn.be.entity.Doctor;
import nhb.vn.be.entity.MedicalRecord;
import nhb.vn.be.entity.Patient;
import nhb.vn.be.exception.AppException;
import nhb.vn.be.exception.ErrorCode;
import nhb.vn.be.mapper.MedicalRecordMapper;
import nhb.vn.be.repository.AppointmentRepository;
import nhb.vn.be.repository.DoctorRepository;
import nhb.vn.be.repository.MedicalRecordRepository;
import nhb.vn.be.repository.PatientRepository;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MedicalRecordService {
    MedicalRecordRepository medicalRecordRepository;
    PatientRepository patientRepository;
    DoctorRepository doctorRepository;
    AppointmentRepository appointmentRepository;
    MedicalRecordMapper medicalRecordMapper;

    @Transactional
    public MedicalRecordResponse createMedicalRecord(MedicalRecordRequest request) {
        // Lấy patient từ patientId trong request
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new AppException(ErrorCode.PATIENT_NOT_EXISTED));

        // Lấy doctor từ doctorId trong request
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_EXISTED));

        Appointment appointment = null;
        if (request.getAppointmentId() != null) {
            appointment = appointmentRepository.findById(request.getAppointmentId())
                    .orElseThrow(() -> new AppException(ErrorCode.APPOINTMENT_NOT_EXISTED));

            if (medicalRecordRepository.existsByAppointmentId(request.getAppointmentId())) {
                throw new AppException(ErrorCode.DATA_INTEGRITY_VIOLATION, "Medical record already exists for this appointment");
            }
        }

        MedicalRecord medicalRecord = medicalRecordMapper.toMedicalRecord(request);
        medicalRecord.setPatient(patient);
        medicalRecord.setDoctor(doctor);
        medicalRecord.setAppointment(appointment);

        medicalRecord = medicalRecordRepository.save(medicalRecord);

        return medicalRecordMapper.toMedicalRecordResponse(medicalRecord);
    }

    public PageResponse<MedicalRecordResponse> getPatientMedicalRecords(UUID patientId, Pageable pageable) {
        Page<MedicalRecord> records = medicalRecordRepository.findByPatientId(patientId, pageable);
        return buildPageResponse(records.map(medicalRecordMapper::toMedicalRecordResponse));
    }

    public PageResponse<MedicalRecordResponse> getDoctorMedicalRecords(UUID doctorId, Pageable pageable) {
        Page<MedicalRecord> records = medicalRecordRepository.findByDoctorId(doctorId, pageable);
        return buildPageResponse(records.map(medicalRecordMapper::toMedicalRecordResponse));
    }

    public MedicalRecordResponse getMedicalRecord(Long id) {
        MedicalRecord record = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.MEDICAL_RECORD_NOT_EXISTED));
        return medicalRecordMapper.toMedicalRecordResponse(record);
    }

    @Transactional
    public MedicalRecordResponse updateMedicalRecord(Long id, MedicalRecordRequest request) {
        MedicalRecord record = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.MEDICAL_RECORD_NOT_EXISTED));

        record.setTitle(request.getTitle());
        record.setDate(request.getDate());
        record.setStatus(request.getStatus());
        record.setIcon(request.getIcon());
        record.setIconBg(request.getIconBg());
        record.setIconColor(request.getIconColor());
        record.setDiagnosis(request.getDiagnosis());
        record.setNotes(request.getNotes());

        // Có thể update patient và doctor nếu cần
        if (request.getPatientId() != null) {
            Patient patient = patientRepository.findById(request.getPatientId())
                    .orElseThrow(() -> new AppException(ErrorCode.PATIENT_NOT_EXISTED));
            record.setPatient(patient);
        }

        if (request.getDoctorId() != null) {
            Doctor doctor = doctorRepository.findById(request.getDoctorId())
                    .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_EXISTED));
            record.setDoctor(doctor);
        }

        record = medicalRecordRepository.save(record);

        return medicalRecordMapper.toMedicalRecordResponse(record);
    }

    @Transactional
    public void deleteMedicalRecord(Long id) {
        if (!medicalRecordRepository.existsById(id)) {
            throw new AppException(ErrorCode.MEDICAL_RECORD_NOT_EXISTED);
        }
        medicalRecordRepository.deleteById(id);
    }

    private PageResponse<MedicalRecordResponse> buildPageResponse(Page<MedicalRecordResponse> page) {
        return PageResponse.<MedicalRecordResponse>builder()
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