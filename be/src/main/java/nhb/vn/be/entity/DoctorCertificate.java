package nhb.vn.be.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)

@Entity
public class DoctorCertificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    String name;          // "Tiến sĩ Y khoa"
    String issuedBy;      // "Đại học Y Hà Nội"
    int issuedYear;
    String imageUrl;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    Doctor doctor;
}
