package nhb.vn.be.repository;

import nhb.vn.be.entity.NotificationEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {
    Page<NotificationEntity> findByPatientIdOrderByCreatedAtDesc(String patientId, Pageable pageable);
    Page<NotificationEntity> findByPatientIdAndIsReadFalse(String patientId, Pageable pageable);

    @Modifying
    @Transactional
    @Query("UPDATE NotificationEntity n SET n.isRead = true WHERE n.patientId = :patientId")
    void markAllAsRead(@Param("patientId") String patientId);
}
