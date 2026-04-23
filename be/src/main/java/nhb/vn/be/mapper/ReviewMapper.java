package nhb.vn.be.mapper;


import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import nhb.vn.be.dto.request.ReviewRequest;
import nhb.vn.be.dto.response.ReviewResponse;
import nhb.vn.be.entity.Review;

@Mapper(componentModel = "spring")
public interface ReviewMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "patient", ignore = true)
    @Mapping(target = "doctor", ignore = true)
    Review toReview(ReviewRequest request);

    @Mapping(source = "patient.id", target = "patientId")
    @Mapping(source = "patient.fullName", target = "patientName")
    @Mapping(source = "patient.user.avatarUrl", target = "patientAvatar")
    @Mapping(source = "doctor.id", target = "doctorId")
    @Mapping(source = "doctor.fullName", target = "doctorName")
    ReviewResponse toReviewResponse(Review review);
}