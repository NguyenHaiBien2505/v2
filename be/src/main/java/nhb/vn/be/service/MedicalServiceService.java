package nhb.vn.be.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import nhb.vn.be.dto.request.MedicalServiceRequest;
import nhb.vn.be.dto.response.MedicalServiceResponse;
import nhb.vn.be.dto.response.PageResponse;
import nhb.vn.be.entity.MedicalService;
import nhb.vn.be.exception.AppException;
import nhb.vn.be.exception.ErrorCode;
import nhb.vn.be.mapper.MedicalServiceMapper;
import nhb.vn.be.repository.MedicalServiceRepository;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MedicalServiceService {
    MedicalServiceRepository medicalServiceRepository;
    MedicalServiceMapper medicalServiceMapper;

    public MedicalServiceResponse createMedicalService(MedicalServiceRequest request) {
        MedicalService service = medicalServiceMapper.toMedicalService(request);
        service.setCreatedAt(LocalDateTime.now());
        service.setUpdatedAt(LocalDateTime.now());
        service = medicalServiceRepository.save(service);
        return medicalServiceMapper.toMedicalServiceResponse(service);
    }

    public PageResponse<MedicalServiceResponse> getAllMedicalServices(Pageable pageable) {
        Page<MedicalService> services = medicalServiceRepository.findAll(pageable);
        return buildPageResponse(services.map(medicalServiceMapper::toMedicalServiceResponse));
    }

    public PageResponse<MedicalServiceResponse> getServicesByCategory(String category, Pageable pageable) {
        Page<MedicalService> services = medicalServiceRepository.findByCategory(category, pageable);
        return buildPageResponse(services.map(medicalServiceMapper::toMedicalServiceResponse));
    }

    public PageResponse<MedicalServiceResponse> searchMedicalServices(String name, Pageable pageable) {
        Page<MedicalService> services = medicalServiceRepository.findByNameContainingIgnoreCase(name, pageable);
        return buildPageResponse(services.map(medicalServiceMapper::toMedicalServiceResponse));
    }

    public MedicalServiceResponse getMedicalService(Long id) {
        MedicalService service = medicalServiceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SERVICE_NOT_EXISTED));
        return medicalServiceMapper.toMedicalServiceResponse(service);
    }

    public MedicalServiceResponse updateMedicalService(Long id, MedicalServiceRequest request) {
        MedicalService service = medicalServiceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SERVICE_NOT_EXISTED));

        medicalServiceMapper.updateMedicalService(service, request);
        service = medicalServiceRepository.save(service);

        return medicalServiceMapper.toMedicalServiceResponse(service);
    }

    public void deleteMedicalService(Long id) {
        if (!medicalServiceRepository.existsById(id)) {
            throw new AppException(ErrorCode.SERVICE_NOT_EXISTED);
        }
        medicalServiceRepository.deleteById(id);
    }

    private PageResponse<MedicalServiceResponse> buildPageResponse(Page<MedicalServiceResponse> page) {
        return PageResponse.<MedicalServiceResponse>builder()
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