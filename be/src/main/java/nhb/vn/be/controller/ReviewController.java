package nhb.vn.be.controller;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import nhb.vn.be.dto.request.ReviewRequest;
import nhb.vn.be.dto.response.APIResponse;
import nhb.vn.be.dto.response.PageResponse;
import nhb.vn.be.dto.response.ReviewResponse;
import nhb.vn.be.service.ReviewService;

import java.util.UUID;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ReviewController {
    ReviewService reviewService;

    @PostMapping("/patients/{patientId}/doctors/{doctorId}")
    @PreAuthorize("hasRole('PATIENT')")
    public APIResponse<ReviewResponse> createReview(
            @PathVariable UUID patientId,
            @PathVariable UUID doctorId,
            @Valid @RequestBody ReviewRequest request) {
        return APIResponse.<ReviewResponse>builder()
                .result(reviewService.createReview(patientId, doctorId, request))
                .build();
    }

    @GetMapping("/doctors/{doctorId}")
    public APIResponse<PageResponse<ReviewResponse>> getDoctorReviews(
            @PathVariable UUID doctorId,
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        return APIResponse.<PageResponse<ReviewResponse>>builder()
                .result(reviewService.getDoctorReviews(doctorId, pageable))
                .build();
    }

    @GetMapping("/patients/{patientId}")
    @PreAuthorize("hasAnyRole('PATIENT', 'ADMIN')")
    public APIResponse<PageResponse<ReviewResponse>> getPatientReviews(
            @PathVariable UUID patientId,
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        return APIResponse.<PageResponse<ReviewResponse>>builder()
                .result(reviewService.getPatientReviews(patientId, pageable))
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('PATIENT', 'ADMIN')")
    public APIResponse<Void> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return APIResponse.<Void>builder()
                .message("Review deleted successfully")
                .build();
    }
}