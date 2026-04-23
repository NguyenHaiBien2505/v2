package nhb.vn.be.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import nhb.vn.be.dto.request.DoctorCreationRequest;
import nhb.vn.be.dto.request.DoctorUpdateRequest;
import nhb.vn.be.dto.response.DoctorResponse;
import nhb.vn.be.dto.response.PageResponse;
import nhb.vn.be.entity.*;
import nhb.vn.be.exception.AppException;
import nhb.vn.be.exception.ErrorCode;
import nhb.vn.be.mapper.DoctorMapper;
import nhb.vn.be.repository.*;

import java.util.HashSet;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DoctorService {
    DoctorRepository doctorRepository;
    UserRepository userRepository;
    RoleRepository roleRepository;
    SpecialtyRepository specialtyRepository;
    DoctorMapper doctorMapper;
    PasswordEncoder passwordEncoder;
    ReviewRepository reviewRepository;

    @Transactional
    public DoctorResponse createDoctor(DoctorCreationRequest request) {
        // Check if user exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        // Create user account
        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .status("ACTIVE")
                .build();

        // Assign DOCTOR role
        HashSet<Role> roles = new HashSet<>();
        Role doctorRole = roleRepository.findByRoleName("DOCTOR")
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));
        roles.add(doctorRole);
        user.setRoles(roles);

        user = userRepository.save(user);

        // Get specialty
        Specialty specialty = specialtyRepository.findById(request.getSpecialtyId())
                .orElseThrow(() -> new AppException(ErrorCode.SPECIALTY_NOT_EXISTED));

        // Create doctor
        Doctor doctor = doctorMapper.toDoctor(request);
        doctor.setUser(user);
        doctor.setSpecialty(specialty);

        doctor = doctorRepository.save(doctor);

        DoctorResponse response = doctorMapper.toDoctorResponse(doctor);
        enhanceDoctorResponse(response, doctor.getId());

        return response;
    }

    public PageResponse<DoctorResponse> getAllDoctors(Pageable pageable) {
        Page<Doctor> doctors = doctorRepository.findAll(pageable);
        Page<DoctorResponse> responsePage = doctors.map(doctor -> {
            DoctorResponse response = doctorMapper.toDoctorResponse(doctor);
            enhanceDoctorResponse(response, doctor.getId());
            return response;
        });
        return buildPageResponse(responsePage);
    }

    public PageResponse<DoctorResponse> searchDoctors(Long specialtyId, String keyword, Pageable pageable) {
        Page<Doctor> doctors = doctorRepository.searchDoctors(specialtyId, keyword, pageable);
        Page<DoctorResponse> responsePage = doctors.map(doctor -> {
            DoctorResponse response = doctorMapper.toDoctorResponse(doctor);
            enhanceDoctorResponse(response, doctor.getId());
            return response;
        });
        return buildPageResponse(responsePage);
    }

    public DoctorResponse getDoctor(UUID id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_EXISTED));
        DoctorResponse response = doctorMapper.toDoctorResponse(doctor);
        enhanceDoctorResponse(response, doctor.getId());
        return response;
    }

    @Transactional
    public DoctorResponse updateDoctor(UUID id, DoctorUpdateRequest request) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_EXISTED));

        doctorMapper.updateDoctor(doctor, request);

        if (request.getSpecialtyId() != null) {
            Specialty specialty = specialtyRepository.findById(request.getSpecialtyId())
                    .orElseThrow(() -> new AppException(ErrorCode.SPECIALTY_NOT_EXISTED));
            doctor.setSpecialty(specialty);
        }

        doctor = doctorRepository.save(doctor);

        DoctorResponse response = doctorMapper.toDoctorResponse(doctor);
        enhanceDoctorResponse(response, doctor.getId());

        return response;
    }

    @Transactional
    public void deleteDoctor(UUID id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_EXISTED));

        // Delete user account as well
        User user = doctor.getUser();
        doctorRepository.delete(doctor);
        if (user != null) {
            userRepository.delete(user);
        }
    }

    public DoctorResponse getDoctorByUserId(UUID userId) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_EXISTED));
        DoctorResponse response = doctorMapper.toDoctorResponse(doctor);
        enhanceDoctorResponse(response, doctor.getId());
        return response;
    }

    private void enhanceDoctorResponse(DoctorResponse response, UUID doctorId) {
        Double avgRating = doctorRepository.getAverageRating(doctorId);
        Long totalReviews = doctorRepository.getTotalReviews(doctorId);

        response.setAverageRating(avgRating != null ? avgRating : 0.0);
        response.setTotalReviews(totalReviews != null ? totalReviews : 0L);
    }

    private PageResponse<DoctorResponse> buildPageResponse(Page<DoctorResponse> page) {
        return PageResponse.<DoctorResponse>builder()
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