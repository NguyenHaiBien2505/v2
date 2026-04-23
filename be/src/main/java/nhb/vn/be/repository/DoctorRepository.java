package nhb.vn.be.repository;

import nhb.vn.be.entity.Doctor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, UUID> {
    Optional<Doctor> findByUserId(UUID userId);

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
}
