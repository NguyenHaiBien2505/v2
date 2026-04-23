package nhb.vn.be.repository;



import nhb.vn.be.entity.Specialty;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface SpecialtyRepository extends JpaRepository<Specialty, Long> {
    boolean existsByName(String name);
    Page<Specialty> findByNameContainingIgnoreCase(String name, Pageable pageable);
}
