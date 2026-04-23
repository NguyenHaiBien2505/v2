package nhb.vn.be.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)

@Entity
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    LocalDate appointmentDate;
    LocalTime startTime;
    LocalTime endTime;

    @Column(length = 20)
    String status;            // PENDING, CONFIRMED, CANCELLED, COMPLETED

    @Column(columnDefinition = "TEXT")
    String reason;            // Lý do khám

    @Column(columnDefinition = "TEXT")
    String notes;

    Integer queueNumber;      // STT trong ngày

    @Column(length = 20)
    String appointmentType;   // FIRST_VISIT, REVISIT

    @ManyToOne
    @JoinColumn(name = "schedule_id")
    Schedule schedule;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    Patient patient;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    Doctor doctor;

    @OneToOne(mappedBy = "appointment")
    MedicalRecord medicalRecord;

    @OneToOne(mappedBy = "appointment")
    Prescription prescription;
}