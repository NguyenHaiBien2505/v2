package nhb.vn.be.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import nhb.vn.be.dto.request.ReviewRequest;
import nhb.vn.be.dto.response.PageResponse;
import nhb.vn.be.dto.response.ReviewResponse;
import nhb.vn.be.entity.Doctor;
import nhb.vn.be.entity.Patient;
import nhb.vn.be.entity.Review;
import nhb.vn.be.exception.AppException;
import nhb.vn.be.exception.ErrorCode;
import nhb.vn.be.mapper.ReviewMapper;
import nhb.vn.be.repository.DoctorRepository;
import nhb.vn.be.repository.PatientRepository;
import nhb.vn.be.repository.ReviewRepository;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ReviewService {
    ReviewRepository reviewRepository;
    DoctorRepository doctorRepository;
    PatientRepository patientRepository;
    ReviewMapper reviewMapper;

    public ReviewResponse createReview(UUID patientId, UUID doctorId, ReviewRequest request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new AppException(ErrorCode.PATIENT_NOT_EXISTED));

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_EXISTED));

        // Check if patient already reviewed this doctor
        if (reviewRepository.existsByPatientIdAndDoctorId(patientId, doctorId)) {
            throw new AppException(ErrorCode.DATA_INTEGRITY_VIOLATION, "You have already reviewed this doctor");
        }

        Review review = reviewMapper.toReview(request);
        review.setPatient(patient);
        review.setDoctor(doctor);

        review = reviewRepository.save(review);

        return reviewMapper.toReviewResponse(review);
    }

    public PageResponse<ReviewResponse> getDoctorReviews(UUID doctorId, Pageable pageable) {
        Page<Review> reviews = reviewRepository.findByDoctorId(doctorId, pageable);
        return buildPageResponse(reviews.map(reviewMapper::toReviewResponse));
    }

    public PageResponse<ReviewResponse> getPatientReviews(UUID patientId, Pageable pageable) {
        Page<Review> reviews = reviewRepository.findByPatientId(patientId, pageable);
        return buildPageResponse(reviews.map(reviewMapper::toReviewResponse));
    }

    public void deleteReview(Long id) {
        if (!reviewRepository.existsById(id)) {
            throw new AppException(ErrorCode.DATA_INTEGRITY_VIOLATION, "Review not found");
        }
        reviewRepository.deleteById(id);
    }

    private PageResponse<ReviewResponse> buildPageResponse(Page<ReviewResponse> page) {
        return PageResponse.<ReviewResponse>builder()
                .content(page.getContent())
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }
}