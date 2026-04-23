package nhb.vn.be.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)

@Entity
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    String diagnosis;
    String notes;

    @OneToOne
    @JoinColumn(name = "appointment_id")
    Appointment appointment;

    @OneToMany(mappedBy = "prescription")
    Set<PrescriptionDetail> details;
}