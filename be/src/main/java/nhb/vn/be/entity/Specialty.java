package nhb.vn.be.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)

@Entity
public class Specialty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    String name;
    String icon;         // Material icon name: "stethoscope", "cardiology", ...
    String description;

    @OneToMany(mappedBy = "specialty")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    Set<Doctor> doctors;
}