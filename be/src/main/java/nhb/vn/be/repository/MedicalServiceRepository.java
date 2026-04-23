package nhb.vn.be.repository;

import nhb.vn.be.entity.MedicalService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MedicalServiceRepository extends JpaRepository<MedicalService, Long> {
    Page<MedicalService> findByCategory(String category, Pageable pageable);
    Page<MedicalService> findByNameContainingIgnoreCase(String name, Pageable pageable);
}
