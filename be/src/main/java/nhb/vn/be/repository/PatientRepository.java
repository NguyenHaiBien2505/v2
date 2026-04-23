package nhb.vn.be.repository;

import nhb.vn.be.entity.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatientRepository extends JpaRepository<Patient, UUID> {
    Optional<Patient> findByUserId(UUID userId);
    Optional<Patient> findByPatientCode(String patientCode);

    @Query("SELECT p FROM Patient p WHERE " +
            "(:keyword IS NULL OR LOWER(p.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.patientCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.phone) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Patient> searchPatients(@Param("keyword") String keyword, Pageable pageable);
}
