package nhb.vn.be.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import nhb.vn.be.dto.request.ScheduleRequest;
import nhb.vn.be.dto.response.PageResponse;
import nhb.vn.be.dto.response.ScheduleResponse;
import nhb.vn.be.entity.Doctor;
import nhb.vn.be.entity.Schedule;
import nhb.vn.be.exception.AppException;
import nhb.vn.be.exception.ErrorCode;
import nhb.vn.be.mapper.ScheduleMapper;
import nhb.vn.be.repository.AppointmentRepository;
import nhb.vn.be.repository.DoctorRepository;
import nhb.vn.be.repository.ScheduleRepository;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ScheduleService {
    ScheduleRepository scheduleRepository;
    DoctorRepository doctorRepository;
    AppointmentRepository appointmentRepository;
    ScheduleMapper scheduleMapper;

    public ScheduleResponse createSchedule(UUID doctorId, ScheduleRequest request) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_EXISTED));

        Schedule schedule = scheduleMapper.toSchedule(request);
        schedule.setDoctor(doctor);
        schedule.setStatus(request.getStatus() != null ? request.getStatus() : "ACTIVE");

        schedule = scheduleRepository.save(schedule);

        return scheduleMapper.toScheduleResponse(schedule);
    }

    public PageResponse<ScheduleResponse> getDoctorSchedules(UUID doctorId, Pageable pageable) {
        Page<Schedule> schedules = scheduleRepository.findUpcomingSchedules(doctorId, pageable);
        Page<ScheduleResponse> responsePage = schedules.map(schedule -> {
            ScheduleResponse response = scheduleMapper.toScheduleResponse(schedule);
            int bookedCount = appointmentRepository.countBookedAppointments(schedule.getId());
            response.setBookedCount(bookedCount);
            return response;
        });
        return buildPageResponse(responsePage);
    }

    public ScheduleResponse getSchedule(Long id) {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SCHEDULE_NOT_EXISTED));
        ScheduleResponse response = scheduleMapper.toScheduleResponse(schedule);
        response.setBookedCount(appointmentRepository.countBookedAppointments(id));
        return response;
    }

    public ScheduleResponse updateSchedule(Long id, ScheduleRequest request) {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SCHEDULE_NOT_EXISTED));

        scheduleMapper.updateSchedule(schedule, request);
        schedule = scheduleRepository.save(schedule);

        ScheduleResponse response = scheduleMapper.toScheduleResponse(schedule);
        response.setBookedCount(appointmentRepository.countBookedAppointments(id));
        return response;
    }

    public void deleteSchedule(Long id) {
        if (!scheduleRepository.existsById(id)) {
            throw new AppException(ErrorCode.SCHEDULE_NOT_EXISTED);
        }
        scheduleRepository.deleteById(id);
    }

    private PageResponse<ScheduleResponse> buildPageResponse(Page<ScheduleResponse> page) {
        return PageResponse.<ScheduleResponse>builder()
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