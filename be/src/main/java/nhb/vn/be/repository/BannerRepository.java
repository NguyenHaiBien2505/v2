package nhb.vn.be.repository;

import nhb.vn.be.entity.BannerEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BannerRepository extends JpaRepository<BannerEntity, Long> {
    List<BannerEntity> findByIsActiveTrueOrderBySortOrderAsc();
    Page<BannerEntity> findByIsActive(Boolean isActive, Pageable pageable);
}
