package nhb.vn.be.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)

@Entity
public class Admin {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    String fullName;
    String phone;
    String department;

    @OneToOne
    @JoinColumn(name = "user_id")
    User user;
}