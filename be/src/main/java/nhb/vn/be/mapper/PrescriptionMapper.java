package nhb.vn.be.mapper;


import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import nhb.vn.be.dto.request.PrescriptionDetailRequest;
import nhb.vn.be.dto.request.PrescriptionRequest;
import nhb.vn.be.dto.response.PrescriptionDetailResponse;
import nhb.vn.be.dto.response.PrescriptionResponse;
import nhb.vn.be.entity.Prescription;
import nhb.vn.be.entity.PrescriptionDetail;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PrescriptionMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "details", ignore = true)
    @Mapping(target = "appointment", ignore = true)
    Prescription toPrescription(PrescriptionRequest request);

    @Mapping(source = "appointment.id", target = "appointmentId")
    PrescriptionResponse toPrescriptionResponse(Prescription prescription);

    List<PrescriptionDetailResponse> toPrescriptionDetailResponses(List<PrescriptionDetail> details);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "prescription", ignore = true)
    PrescriptionDetail toPrescriptionDetail(PrescriptionDetailRequest request);
}
