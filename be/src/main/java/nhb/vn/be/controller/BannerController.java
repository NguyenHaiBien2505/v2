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
import nhb.vn.be.dto.request.BannerRequest;
import nhb.vn.be.dto.response.APIResponse;
import nhb.vn.be.dto.response.BannerResponse;
import nhb.vn.be.dto.response.PageResponse;
import nhb.vn.be.service.BannerService;

import java.util.List;

@RestController
@RequestMapping("/banners")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BannerController {
    BannerService bannerService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public APIResponse<BannerResponse> createBanner(@Valid @RequestBody BannerRequest request) {
        return APIResponse.<BannerResponse>builder()
                .result(bannerService.createBanner(request))
                .build();
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public APIResponse<PageResponse<BannerResponse>> getAllBanners(
            @PageableDefault(size = 10, sort = "sortOrder", direction = Sort.Direction.ASC) Pageable pageable) {
        return APIResponse.<PageResponse<BannerResponse>>builder()
                .result(bannerService.getAllBanners(pageable))
                .build();
    }

    @GetMapping("/active")
    public APIResponse<List<BannerResponse>> getActiveBanners() {
        return APIResponse.<List<BannerResponse>>builder()
                .result(bannerService.getActiveBanners())
                .build();
    }

    @GetMapping("/{id}")
    public APIResponse<BannerResponse> getBanner(@PathVariable Long id) {
        return APIResponse.<BannerResponse>builder()
                .result(bannerService.getBanner(id))
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public APIResponse<BannerResponse> updateBanner(@PathVariable Long id, @Valid @RequestBody BannerRequest request) {
        return APIResponse.<BannerResponse>builder()
                .result(bannerService.updateBanner(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public APIResponse<Void> deleteBanner(@PathVariable Long id) {
        bannerService.deleteBanner(id);
        return APIResponse.<Void>builder()
                .message("Banner deleted successfully")
                .build();
    }
}