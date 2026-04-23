package nhb.vn.be.repository;

import nhb.vn.be.entity.MedicalRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    Page<MedicalRecord> findByPatientId(UUID patientId, Pageable pageable);
    Page<MedicalRecord> findByDoctorId(UUID doctorId, Pageable pageable);
    boolean existsByAppointmentId(Long appointmentId);
}
