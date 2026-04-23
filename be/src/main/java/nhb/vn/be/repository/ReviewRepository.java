package nhb.vn.be.repository;

import nhb.vn.be.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findByDoctorId(UUID doctorId, Pageable pageable);
    Page<Review> findByPatientId(UUID patientId, Pageable pageable);

    boolean existsByPatientIdAndDoctorId(UUID patientId, UUID doctorId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.doctor.id = :doctorId")
    Double getAverageRatingByDoctor(@Param("doctorId") UUID doctorId);
}