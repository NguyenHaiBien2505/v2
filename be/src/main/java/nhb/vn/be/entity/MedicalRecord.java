package nhb.vn.be.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)

@Entity
public class MedicalRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    String title;        // "Khám chuyên khoa Tim mạch"
    LocalDate date;      // Ngày khám
    String status;       // "hoàn thành", "đã lưu trữ", "chưa giải quyết"

    String icon;         // Material icon: "cardiology", "medical_services", "biotech"
    String iconBg;       // CSS class: "bg-primary-fixed"
    String iconColor;    // CSS class: "text-primary"

    @Column(columnDefinition = "TEXT")
    String diagnosis;

    @Column(columnDefinition = "TEXT")
    String notes;

    @ManyToOne
    Patient patient;

    @ManyToOne
    Doctor doctor;

    @OneToOne
    @JoinColumn(name = "appointment_id")
    Appointment appointment;
}