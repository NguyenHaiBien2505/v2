package nhb.vn.be.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(unique = true)
    String username;

    String password;
    String avatarUrl;

    @Column(length = 20)
    String status; // ACTIVE, INACTIVE

    LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (status == null) status = "ACTIVE";
    }

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_role",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    Set<Role> roles;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    Admin admin;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    Doctor doctor;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    Patient patient;
}