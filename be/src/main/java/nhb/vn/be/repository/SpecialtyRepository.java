package nhb.vn.be.repository;

import nhb.vn.be.entity.Specialty;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SpecialtyRepository extends JpaRepository<Specialty, Long> {

    Optional<Specialty> findByName(String name);

    // Tìm theo tên chứa (không phân biệt hoa thường) - KHÔNG phân trang, trả về List
    @Query("SELECT s FROM Specialty s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Specialty> findByNameContainingIgnoreCase(@Param("name") String name);

    // Tìm theo tên chứa (không phân biệt hoa thường) - CÓ phân trang, trả về Page
    @Query("SELECT s FROM Specialty s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<Specialty> findByNameContainingIgnoreCasePageable(@Param("name") String name, Pageable pageable);

    // Tìm chính xác theo tên (không phân biệt hoa thường)
    @Query("SELECT s FROM Specialty s WHERE LOWER(s.name) = LOWER(:name)")
    Optional<Specialty> findByNameIgnoreCase(@Param("name") String name);

    // Kiểm tra tên đã tồn tại chưa
    boolean existsByName(String name);

    Page<Specialty> findByNameContainingIgnoreCase(String name, Pageable pageable);
}