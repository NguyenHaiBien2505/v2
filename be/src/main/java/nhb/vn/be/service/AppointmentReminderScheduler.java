package nhb.vn.be.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nhb.vn.be.entity.Appointment;
import nhb.vn.be.repository.AppointmentRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Scheduled tasks để tự động gửi email nhắc nhở lịch khám.
 * Cần bật @EnableScheduling và @EnableAsync trong BeApplication.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AppointmentReminderScheduler {

    private final AppointmentRepository appointmentRepository;
    private final EmailService emailService;

    /**
     * Mỗi ngày lúc 08:00 sáng: gửi email nhắc nhở cho tất cả bệnh nhân
     * có lịch khám VÀO NGÀY MAI.
     *
     * Cron: giây phút giờ ngày tháng thứ
     */
    @Scheduled(cron = "0 0 8 * * *")
    public void sendDayBeforeReminders() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        log.info("[Scheduler] Gửi email nhắc lịch khám ngày {}", tomorrow);

        List<Appointment> upcoming = appointmentRepository
                .findAppointmentsByDateAndStatus(tomorrow, List.of("PENDING", "CONFIRMED"));

        log.info("[Scheduler] Tìm thấy {} lịch hẹn cần nhắc nhở", upcoming.size());

        for (Appointment appointment : upcoming) {
            try {
                emailService.sendAppointmentReminder(appointment);
            } catch (Exception e) {
                log.error("[Scheduler] Lỗi khi gửi nhắc nhở cho appointment {}: {}",
                        appointment.getId(), e.getMessage());
            }
        }
    }

    /**
     * Mỗi giờ: gửi email nhắc nhở cho các bệnh nhân có lịch khám trong vòng 2 giờ tới.
     */
    @Scheduled(cron = "0 0 * * * *")
    public void sendHourBeforeReminders() {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();
        LocalTime twoHoursLater = now.plusHours(2);

        List<Appointment> upcoming = appointmentRepository
                .findAppointmentsIn2Hours(today, now, twoHoursLater);

        if (!upcoming.isEmpty()) {
            log.info("[Scheduler] Gửi email nhắc lịch trong 2h tới: {} lịch", upcoming.size());
        }

        for (Appointment appointment : upcoming) {
            try {
                emailService.sendAppointmentReminder(appointment);
            } catch (Exception e) {
                log.error("[Scheduler] Lỗi nhắc 2h cho appointment {}: {}",
                        appointment.getId(), e.getMessage());
            }
        }
    }
}
