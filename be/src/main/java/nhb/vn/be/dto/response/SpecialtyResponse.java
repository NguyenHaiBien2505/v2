package nhb.vn.be.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SpecialtyResponse {
    Long id;
    String name;
    String icon;
    String description;
    List<DoctorResponse> doctors;
}