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
import nhb.vn.be.dto.request.PatientCreationRequest;
import nhb.vn.be.dto.request.PatientUpdateRequest;
import nhb.vn.be.dto.response.PageResponse;
import nhb.vn.be.dto.response.PatientResponse;
import nhb.vn.be.entity.Patient;
import nhb.vn.be.entity.Role;
import nhb.vn.be.entity.User;
import nhb.vn.be.exception.AppException;
import nhb.vn.be.exception.ErrorCode;
import nhb.vn.be.mapper.PatientMapper;
import nhb.vn.be.repository.PatientRepository;
import nhb.vn.be.repository.RoleRepository;
import nhb.vn.be.repository.UserRepository;

import java.util.HashSet;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PatientService {
    PatientRepository patientRepository;
    UserRepository userRepository;
    RoleRepository roleRepository;
    PatientMapper patientMapper;
    PasswordEncoder passwordEncoder;

    @Transactional
    public PatientResponse createPatient(PatientCreationRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        // Create user account
        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .status("ACTIVE")
                .build();

        // Assign PATIENT role
        HashSet<Role> roles = new HashSet<>();
        Role patientRole = roleRepository.findByRoleName("PATIENT")
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));
        roles.add(patientRole);
        user.setRoles(roles);

        user = userRepository.save(user);

        // Create patient
        Patient patient = patientMapper.toPatient(request);
        patient.setUser(user);

        patient = patientRepository.save(patient);

        return patientMapper.toPatientResponse(patient);
    }

    public PageResponse<PatientResponse> getAllPatients(Pageable pageable) {
        Page<Patient> patients = patientRepository.findAll(pageable);
        return buildPageResponse(patients.map(patientMapper::toPatientResponse));
    }

    public PageResponse<PatientResponse> searchPatients(String keyword, Pageable pageable) {
        Page<Patient> patients = patientRepository.searchPatients(keyword, pageable);
        return buildPageResponse(patients.map(patientMapper::toPatientResponse));
    }

    public PatientResponse getPatient(UUID id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PATIENT_NOT_EXISTED));
        return patientMapper.toPatientResponse(patient);
    }

    @Transactional
    public PatientResponse updatePatient(UUID id, PatientUpdateRequest request) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PATIENT_NOT_EXISTED));

        patientMapper.updatePatient(patient, request);
        patient = patientRepository.save(patient);

        return patientMapper.toPatientResponse(patient);
    }

    @Transactional
    public void deletePatient(UUID id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PATIENT_NOT_EXISTED));

        User user = patient.getUser();
        patientRepository.delete(patient);
        if (user != null) {
            userRepository.delete(user);
        }
    }

    public PatientResponse getPatientByUserId(UUID userId) {
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.PATIENT_NOT_EXISTED));
        return patientMapper.toPatientResponse(patient);
    }

    private PageResponse<PatientResponse> buildPageResponse(Page<PatientResponse> page) {
        return PageResponse.<PatientResponse>builder()
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