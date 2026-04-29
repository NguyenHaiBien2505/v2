package nhb.vn.be.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import nhb.vn.be.dto.request.AppointmentRequest;
import nhb.vn.be.dto.response.AppointmentResponse;
import nhb.vn.be.dto.response.PageResponse;
import nhb.vn.be.entity.Appointment;
import nhb.vn.be.entity.Doctor;
import nhb.vn.be.entity.Patient;
import nhb.vn.be.entity.Schedule;
import nhb.vn.be.exception.AppException;
import nhb.vn.be.exception.ErrorCode;
import nhb.vn.be.mapper.AppointmentMapper;
import nhb.vn.be.repository.AppointmentRepository;
import nhb.vn.be.repository.DoctorRepository;
import nhb.vn.be.repository.PatientRepository;
import nhb.vn.be.repository.ScheduleRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AppointmentService {
    AppointmentRepository appointmentRepository;
    DoctorRepository doctorRepository;
    PatientRepository patientRepository;
    ScheduleRepository scheduleRepository;
    AppointmentMapper appointmentMapper;

    @Transactional
    public AppointmentResponse createAppointment(UUID patientId, UUID doctorId, AppointmentRequest request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new AppException(ErrorCode.PATIENT_NOT_EXISTED));

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_EXISTED));

        // Calculate end time (default 30 minutes per appointment)
        LocalTime requestedEndTime = request.getStartTime().plusMinutes(30);

        // Prevent overlap with existing active appointments of the same doctor
        if (appointmentRepository.existsDoctorTimeConflict(
            doctorId,
            request.getAppointmentDate(),
            request.getStartTime(),
            requestedEndTime)) {
            throw new AppException(ErrorCode.APPOINTMENT_CONFLICT);
        }

        // Prevent overlap with patient's own active appointments
        if (appointmentRepository.existsPatientTimeConflict(
            patientId,
            request.getAppointmentDate(),
            request.getStartTime(),
            requestedEndTime)) {
            throw new AppException(ErrorCode.APPOINTMENT_CONFLICT);
        }

        // Find schedule
        Schedule schedule = scheduleRepository.findByDoctorIdAndWorkDate(doctorId, request.getAppointmentDate())
                .stream()
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.SCHEDULE_NOT_EXISTED));

        // Ensure requested time is inside the doctor's working schedule
        if (request.getStartTime().isBefore(schedule.getStartTime()) || requestedEndTime.isAfter(schedule.getEndTime())) {
            throw new AppException(ErrorCode.APPOINTMENT_CONFLICT);
        }

        // Check schedule availability
        int bookedCount = appointmentRepository.countBookedAppointments(schedule.getId());
        if (bookedCount >= schedule.getMaxPatient()) {
            throw new AppException(ErrorCode.SCHEDULE_FULL);
        }

        Appointment appointment = appointmentMapper.toAppointment(request);
        appointment.setEndTime(requestedEndTime);
        appointment.setStatus("PENDING");
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setSchedule(schedule);
        appointment.setQueueNumber(bookedCount + 1);

        appointment = appointmentRepository.save(appointment);

        return appointmentMapper.toAppointmentResponse(appointment);
    }

    public PageResponse<AppointmentResponse> getPatientAppointments(UUID patientId, Pageable pageable) {
        Page<Appointment> appointments = appointmentRepository.findByPatientId(patientId, pageable);
        return buildPageResponse(appointments.map(appointmentMapper::toAppointmentResponse));
    }

    public PageResponse<AppointmentResponse> getDoctorAppointments(UUID doctorId, Pageable pageable) {
        Page<Appointment> appointments = appointmentRepository.findByDoctorId(doctorId, pageable);
        return buildPageResponse(appointments.map(appointmentMapper::toAppointmentResponse));
    }

    public AppointmentResponse getAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.APPOINTMENT_NOT_EXISTED));
        return appointmentMapper.toAppointmentResponse(appointment);
    }

    @Transactional
    public AppointmentResponse updateAppointmentStatus(Long id, String status) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.APPOINTMENT_NOT_EXISTED));

        appointment.setStatus(status);
        appointment = appointmentRepository.save(appointment);

        return appointmentMapper.toAppointmentResponse(appointment);
    }

    @Transactional
    public void cancelAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.APPOINTMENT_NOT_EXISTED));

        appointment.setStatus("CANCELLED");
        appointmentRepository.save(appointment);
    }

    private PageResponse<AppointmentResponse> buildPageResponse(Page<AppointmentResponse> page) {
        return PageResponse.<AppointmentResponse>builder()
                .content(page.getContent())
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }


    // Thêm vào AppointmentService.java

    public List<Appointment> getPatientAppointmentsList(UUID patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    public int countBookedAppointments(Long scheduleId) {
        return appointmentRepository.countBookedAppointments(scheduleId);
    }

    public Appointment getAppointmentEntity(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.APPOINTMENT_NOT_EXISTED));
    }

    public List<Appointment> getUpcomingAppointmentsByPatient(UUID patientId) {
        return appointmentRepository.findUpcomingAppointmentsByPatient(patientId);
    }
}
