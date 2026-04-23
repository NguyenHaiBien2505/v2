package nhb.vn.be.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)

@Entity
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(unique = true, length = 20)
    String patientCode;     // VD: "00000001"

    String fullName;
    String phone;
    String address;
    String gender;          // MALE, FEMALE, OTHER
    String bloodType;       // A+, A-, B+, B-, AB+, AB-, O+, O-
    String allergies;
    String medicalHistory;

    LocalDate dob;

    @PrePersist
    void prePersist() {
        // Auto-generate patientCode if not set
        if (patientCode == null) {
            patientCode = String.format("%08d", System.currentTimeMillis() % 100000000);
        }
    }

    @OneToOne
    @JoinColumn(name = "user_id")
    User user;

    @OneToMany(mappedBy = "patient")
    Set<Appointment> appointments;

    @OneToMany(mappedBy = "patient")
    Set<MedicalRecord> medicalRecords;

    @OneToMany(mappedBy = "patient")
    Set<Review> reviews;
}