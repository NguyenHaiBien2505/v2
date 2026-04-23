package nhb.vn.be.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuditLogEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "user_id")
    Long userId;

    @Column(name = "user_name")
    String userName;

    String action;

    String entity;

    @Column(name = "entity_id")
    Long entityId;

    @Column(name = "old_value", columnDefinition = "TEXT")
    String oldValue;

    @Column(name = "new_value", columnDefinition = "TEXT")
    String newValue;

    @Column(name = "ip_address")
    String ipAddress;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    LocalDateTime createdAt;

}
