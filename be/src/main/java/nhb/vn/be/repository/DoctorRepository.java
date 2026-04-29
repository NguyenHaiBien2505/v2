package nhb.vn.be.repository;

import nhb.vn.be.entity.Doctor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, UUID> {

    Optional<Doctor> findByUserId(UUID userId);

    // Tìm bác sĩ theo specialtyId (phân trang)
    Page<Doctor> findBySpecialtyId(Long specialtyId, Pageable pageable);

    // Tìm bác sĩ theo specialtyId (không phân trang)
    List<Doctor> findBySpecialtyId(Long specialtyId);

    @Query("SELECT d FROM Doctor d WHERE " +
            "(:specialtyId IS NULL OR d.specialty.id = :specialtyId) AND " +
            "(:keyword IS NULL OR LOWER(d.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(d.degree) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Doctor> searchDoctors(@Param("specialtyId") Long specialtyId,
                               @Param("keyword") String keyword,
                               Pageable pageable);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.doctor.id = :doctorId")
    Double getAverageRating(@Param("doctorId") UUID doctorId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.doctor.id = :doctorId")
    Long getTotalReviews(@Param("doctorId") UUID doctorId);

    // Tìm bác sĩ theo tên (không phân biệt hoa thường)
    @Query("SELECT d FROM Doctor d WHERE LOWER(d.fullName) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Doctor> findByFullNameContainingIgnoreCase(@Param("name") String name);

    // Tìm bác sĩ theo tên chính xác
    @Query("SELECT d FROM Doctor d WHERE LOWER(d.fullName) = LOWER(:fullName)")
    Optional<Doctor> findByFullNameIgnoreCase(@Param("fullName") String fullName);

    // Tìm bác sĩ theo chuyên khoa (chứa tên)
    @Query("SELECT d FROM Doctor d WHERE LOWER(d.specialty.name) LIKE LOWER(CONCAT('%', :specialtyName, '%'))")
    List<Doctor> findBySpecialtyNameContaining(@Param("specialtyName") String specialtyName);

    // Top bác sĩ có rating cao nhất
    @Query("""
            SELECT d FROM Doctor d 
            ORDER BY (SELECT COALESCE(AVG(r.rating), 0) FROM Review r WHERE r.doctor = d) DESC
            """)
    List<Doctor> findTop3ByOrderByRatingDesc(Pageable pageable);
}