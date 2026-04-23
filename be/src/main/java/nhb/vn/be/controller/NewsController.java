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
import nhb.vn.be.dto.request.NewsRequest;
import nhb.vn.be.dto.response.APIResponse;
import nhb.vn.be.dto.response.NewsResponse;
import nhb.vn.be.dto.response.PageResponse;
import nhb.vn.be.service.NewsService;

@RestController
@RequestMapping("/news")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NewsController {
    NewsService newsService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public APIResponse<NewsResponse> createNews(@Valid @RequestBody NewsRequest request) {
        return APIResponse.<NewsResponse>builder()
                .result(newsService.createNews(request))
                .build();
    }

    @GetMapping
    public APIResponse<PageResponse<NewsResponse>> getAllNews(
            @PageableDefault(size = 10, sort = "publishedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return APIResponse.<PageResponse<NewsResponse>>builder()
                .result(newsService.getAllNews(pageable))
                .build();
    }

    @GetMapping("/featured")
    public APIResponse<PageResponse<NewsResponse>> getFeaturedNews(
            @PageableDefault(size = 5) Pageable pageable) {
        return APIResponse.<PageResponse<NewsResponse>>builder()
                .result(newsService.getFeaturedNews(pageable))
                .build();
    }

    @GetMapping("/category/{category}")
    public APIResponse<PageResponse<NewsResponse>> getNewsByCategory(
            @PathVariable String category,
            @PageableDefault(size = 10, sort = "publishedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return APIResponse.<PageResponse<NewsResponse>>builder()
                .result(newsService.getNewsByCategory(category, pageable))
                .build();
    }

    @GetMapping("/search")
    public APIResponse<PageResponse<NewsResponse>> searchNews(
            @RequestParam String keyword,
            @PageableDefault(size = 10) Pageable pageable) {
        return APIResponse.<PageResponse<NewsResponse>>builder()
                .result(newsService.searchNews(keyword, pageable))
                .build();
    }

    @GetMapping("/{id}")
    public APIResponse<NewsResponse> getNews(@PathVariable Long id) {
        return APIResponse.<NewsResponse>builder()
                .result(newsService.getNews(id))
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public APIResponse<NewsResponse> updateNews(@PathVariable Long id, @Valid @RequestBody NewsRequest request) {
        return APIResponse.<NewsResponse>builder()
                .result(newsService.updateNews(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public APIResponse<Void> deleteNews(@PathVariable Long id) {
        newsService.deleteNews(id);
        return APIResponse.<Void>builder()
                .message("News deleted successfully")
                .build();
    }
}