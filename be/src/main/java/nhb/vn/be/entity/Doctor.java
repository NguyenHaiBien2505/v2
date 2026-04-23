package nhb.vn.be.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)

@Entity
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    String fullName;
    String degree;           // "Phó Giáo sư, Tiến sĩ Y khoa", "Thạc sĩ Y khoa"
    String avatarUrl;        // URL ảnh đại diện

    @Column(columnDefinition = "TEXT")
    String bio;              // Mô tả bác sĩ

    int experienceYears;     // Số năm kinh nghiệm
    BigDecimal clinicFee;    // Phí khám (VNĐ)
    String licenseNumber;    // Số chứng chỉ hành nghề

    String phone;

    @OneToOne
    @JoinColumn(name = "user_id")
    User user;

    @ManyToOne
    @JoinColumn(name = "specialty_id")
    Specialty specialty;

    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, orphanRemoval = true)
    Set<DoctorCertificate> certificates;

    @OneToMany(mappedBy = "doctor")
    Set<Schedule> schedules;

    @OneToMany(mappedBy = "doctor")
    Set<Appointment> appointments;

    @OneToMany(mappedBy = "doctor")
    Set<MedicalRecord> medicalRecords;

    @OneToMany(mappedBy = "doctor")
    Set<Review> reviews;
}