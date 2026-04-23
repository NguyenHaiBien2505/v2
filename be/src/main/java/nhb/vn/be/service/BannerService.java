package nhb.vn.be.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import nhb.vn.be.dto.request.BannerRequest;
import nhb.vn.be.dto.response.BannerResponse;
import nhb.vn.be.dto.response.PageResponse;
import nhb.vn.be.entity.BannerEntity;
import nhb.vn.be.exception.AppException;
import nhb.vn.be.exception.ErrorCode;
import nhb.vn.be.mapper.BannerMapper;
import nhb.vn.be.repository.BannerRepository;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BannerService {
    BannerRepository bannerRepository;
    BannerMapper bannerMapper;

    public BannerResponse createBanner(BannerRequest request) {
        BannerEntity banner = bannerMapper.toBannerEntity(request);
        banner = bannerRepository.save(banner);
        return bannerMapper.toBannerResponse(banner);
    }

    public PageResponse<BannerResponse> getAllBanners(Pageable pageable) {
        Page<BannerEntity> banners = bannerRepository.findAll(pageable);
        return buildPageResponse(banners.map(bannerMapper::toBannerResponse));
    }

    public List<BannerResponse> getActiveBanners() {
        return bannerRepository.findByIsActiveTrueOrderBySortOrderAsc().stream()
                .map(bannerMapper::toBannerResponse)
                .toList();
    }

    public BannerResponse getBanner(Long id) {
        BannerEntity banner = bannerRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BANNER_NOT_EXISTED));
        return bannerMapper.toBannerResponse(banner);
    }

    public BannerResponse updateBanner(Long id, BannerRequest request) {
        BannerEntity banner = bannerRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BANNER_NOT_EXISTED));

        bannerMapper.updateBanner(banner, request);
        banner = bannerRepository.save(banner);

        return bannerMapper.toBannerResponse(banner);
    }

    public void deleteBanner(Long id) {
        if (!bannerRepository.existsById(id)) {
            throw new AppException(ErrorCode.BANNER_NOT_EXISTED);
        }
        bannerRepository.deleteById(id);
    }

    private PageResponse<BannerResponse> buildPageResponse(Page<BannerResponse> page) {
        return PageResponse.<BannerResponse>builder()
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