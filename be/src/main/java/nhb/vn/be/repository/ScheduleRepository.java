package nhb.vn.be.repository;

import nhb.vn.be.entity.Schedule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    List<Schedule> findByDoctorIdAndWorkDate(UUID doctorId, LocalDate workDate);

    @Query("SELECT s FROM Schedule s WHERE s.doctor.id = :doctorId AND s.workDate >= :startDate AND s.workDate <= :endDate")
    List<Schedule> findDoctorSchedulesInDateRange(@Param("doctorId") UUID doctorId,
                                                  @Param("startDate") LocalDate startDate,
                                                  @Param("endDate") LocalDate endDate);

    @Query("SELECT s FROM Schedule s WHERE s.doctor.id = :doctorId AND s.status = 'ACTIVE' AND s.workDate >= CURRENT_DATE")
    Page<Schedule> findUpcomingSchedules(@Param("doctorId") UUID doctorId, Pageable pageable);

    // Trả về List (không phân trang)
    @Query("SELECT s FROM Schedule s WHERE s.doctor.id = :doctorId AND s.status = 'ACTIVE' AND s.workDate >= CURRENT_DATE ORDER BY s.workDate ASC")
    List<Schedule> findUpcomingSchedulesByDoctorId(@Param("doctorId") UUID doctorId);

    // Tìm lịch từ ngày cụ thể
    @Query("SELECT s FROM Schedule s WHERE s.doctor.id = :doctorId AND s.status = 'ACTIVE' AND s.workDate >= :fromDate ORDER BY s.workDate ASC")
    List<Schedule> findUpcomingSchedulesByDoctorId(@Param("doctorId") UUID doctorId,
                                                   @Param("fromDate") LocalDate fromDate);

    // Kiểm tra schedule có tồn tại trong ngày không
    boolean existsByDoctorIdAndWorkDate(UUID doctorId, LocalDate workDate);
}