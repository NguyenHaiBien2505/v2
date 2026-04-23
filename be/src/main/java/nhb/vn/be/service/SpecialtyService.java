package nhb.vn.be.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import nhb.vn.be.dto.request.SpecialtyRequest;
import nhb.vn.be.dto.response.PageResponse;
import nhb.vn.be.dto.response.SpecialtyResponse;
import nhb.vn.be.entity.Specialty;
import nhb.vn.be.exception.AppException;
import nhb.vn.be.exception.ErrorCode;
import nhb.vn.be.mapper.SpecialtyMapper;
import nhb.vn.be.repository.SpecialtyRepository;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SpecialtyService {
    SpecialtyRepository specialtyRepository;
    SpecialtyMapper specialtyMapper;

    public SpecialtyResponse createSpecialty(SpecialtyRequest request) {
        if (specialtyRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.DATA_INTEGRITY_VIOLATION, "Specialty name already exists");
        }

        Specialty specialty = specialtyMapper.toSpecialty(request);
        specialty = specialtyRepository.save(specialty);
        return specialtyMapper.toSpecialtyResponse(specialty);
    }

    public PageResponse<SpecialtyResponse> getAllSpecialties(Pageable pageable) {
        Page<Specialty> specialties = specialtyRepository.findAll(pageable);
        return buildPageResponse(specialties.map(specialtyMapper::toSpecialtyResponse));
    }

    public List<SpecialtyResponse> getAllSpecialtiesList() {
        return specialtyRepository.findAll().stream()
                .map(specialtyMapper::toSpecialtyResponse)
                .collect(Collectors.toList());
    }

    public PageResponse<SpecialtyResponse> searchSpecialties(String name, Pageable pageable) {
        Page<Specialty> specialties = specialtyRepository.findByNameContainingIgnoreCase(name, pageable);
        return buildPageResponse(specialties.map(specialtyMapper::toSpecialtyResponse));
    }

    public SpecialtyResponse getSpecialty(Long id) {
        Specialty specialty = specialtyRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SPECIALTY_NOT_EXISTED));
        return specialtyMapper.toSpecialtyResponse(specialty);
    }

    public SpecialtyResponse updateSpecialty(Long id, SpecialtyRequest request) {
        Specialty specialty = specialtyRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SPECIALTY_NOT_EXISTED));

        specialtyMapper.updateSpecialty(specialty, request);
        specialty = specialtyRepository.save(specialty);

        return specialtyMapper.toSpecialtyResponse(specialty);
    }

    public void deleteSpecialty(Long id) {
        if (!specialtyRepository.existsById(id)) {
            throw new AppException(ErrorCode.SPECIALTY_NOT_EXISTED);
        }
        specialtyRepository.deleteById(id);
    }

    private PageResponse<SpecialtyResponse> buildPageResponse(Page<SpecialtyResponse> page) {
        return PageResponse.<SpecialtyResponse>builder()
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