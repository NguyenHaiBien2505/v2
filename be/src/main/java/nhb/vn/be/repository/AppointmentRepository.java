package nhb.vn.be.repository;

import nhb.vn.be.entity.Appointment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    Page<Appointment> findByPatientId(UUID patientId, Pageable pageable);
    Page<Appointment> findByDoctorId(UUID doctorId, Pageable pageable);

    // Lấy tất cả appointment của patient (không phân trang)
    List<Appointment> findByPatientId(UUID patientId);

    // Lấy appointment theo ID (trả về Optional)
    Optional<Appointment> findById(Long id);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId AND a.appointmentDate = :date")
    List<Appointment> findDoctorAppointmentsByDate(@Param("doctorId") UUID doctorId,
                                                   @Param("date") LocalDate date);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.schedule.id = :scheduleId AND a.status != 'CANCELLED'")
    int countBookedAppointments(@Param("scheduleId") Long scheduleId);

    Optional<Appointment> findByPatientIdAndDoctorIdAndAppointmentDateAndStartTime(
            UUID patientId, UUID doctorId, LocalDate date, LocalTime startTime);

    @Query("SELECT a FROM Appointment a WHERE a.patient.id = :patientId AND a.status IN ('PENDING', 'CONFIRMED')")
    List<Appointment> findActiveAppointmentsByPatient(@Param("patientId") UUID patientId);

    // Lấy appointment sắp tới của patient
    @Query("SELECT a FROM Appointment a WHERE a.patient.id = :patientId AND a.status IN ('PENDING', 'CONFIRMED') AND a.appointmentDate >= CURRENT_DATE ORDER BY a.appointmentDate ASC")
    List<Appointment> findUpcomingAppointmentsByPatient(@Param("patientId") UUID patientId);

    @Query("""
            SELECT COUNT(a) > 0
            FROM Appointment a
            WHERE a.doctor.id = :doctorId
              AND a.appointmentDate = :date
              AND a.status IN ('PENDING', 'CONFIRMED')
              AND a.startTime < :requestedEnd
              AND a.endTime > :requestedStart
            """)
    boolean existsDoctorTimeConflict(@Param("doctorId") UUID doctorId,
                                     @Param("date") LocalDate date,
                                     @Param("requestedStart") LocalTime requestedStart,
                                     @Param("requestedEnd") LocalTime requestedEnd);

    @Query("""
            SELECT COUNT(a) > 0
            FROM Appointment a
            WHERE a.patient.id = :patientId
              AND a.appointmentDate = :date
              AND a.status IN ('PENDING', 'CONFIRMED')
              AND a.startTime < :requestedEnd
              AND a.endTime > :requestedStart
            """)
    boolean existsPatientTimeConflict(@Param("patientId") UUID patientId,
                                      @Param("date") LocalDate date,
                                      @Param("requestedStart") LocalTime requestedStart,
                                      @Param("requestedEnd") LocalTime requestedEnd);
}