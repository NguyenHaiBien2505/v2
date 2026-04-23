package nhb.vn.be.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)

@Entity
public class Schedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    LocalDate workDate;

    LocalTime startTime;
    LocalTime endTime;

    int maxPatient;
    String status;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    Doctor doctor;

    @OneToMany(mappedBy = "schedule")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    Set<Appointment> appointments;
}