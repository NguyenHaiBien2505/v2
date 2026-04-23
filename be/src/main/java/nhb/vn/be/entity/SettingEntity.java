package nhb.vn.be.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SettingEntity {

    @Id
    @Column(name = "setting_key")
    String settingKey;

    @Column(columnDefinition = "TEXT")
    String value;

    @Column(name = "value_type")
    String valueType;

    String description;

    @UpdateTimestamp
    @Column(name = "updated_at")
    LocalDateTime updatedAt;

}
