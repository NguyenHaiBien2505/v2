package nhb.vn.be.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import nhb.vn.be.dto.request.NewsRequest;
import nhb.vn.be.dto.response.NewsResponse;
import nhb.vn.be.dto.response.PageResponse;
import nhb.vn.be.entity.NewsArticle;
import nhb.vn.be.exception.AppException;
import nhb.vn.be.exception.ErrorCode;
import nhb.vn.be.mapper.NewsMapper;
import nhb.vn.be.repository.NewsRepository;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NewsService {
    NewsRepository newsRepository;
    NewsMapper newsMapper;

    public NewsResponse createNews(NewsRequest request) {
        NewsArticle news = newsMapper.toNewsArticle(request);
        if (news.getPublishedAt() == null) {
            news.setPublishedAt(LocalDateTime.now());
        }
        news.setViews(0L);
        news = newsRepository.save(news);
        return newsMapper.toNewsResponse(news);
    }

    public PageResponse<NewsResponse> getAllNews(Pageable pageable) {
        Page<NewsArticle> news = newsRepository.findAll(pageable);
        return buildPageResponse(news.map(newsMapper::toNewsResponse));
    }

    public PageResponse<NewsResponse> getFeaturedNews(Pageable pageable) {
        Page<NewsArticle> news = newsRepository.findByFeaturedTrue(pageable);
        return buildPageResponse(news.map(newsMapper::toNewsResponse));
    }

    public PageResponse<NewsResponse> getNewsByCategory(String category, Pageable pageable) {
        Page<NewsArticle> news = newsRepository.findByCategory(category, pageable);
        return buildPageResponse(news.map(newsMapper::toNewsResponse));
    }

    public PageResponse<NewsResponse> searchNews(String keyword, Pageable pageable) {
        Page<NewsArticle> news = newsRepository.findByTitleContainingIgnoreCaseOrExcerptContainingIgnoreCase(
                keyword, keyword, pageable);
        return buildPageResponse(news.map(newsMapper::toNewsResponse));
    }

    @Transactional
    public NewsResponse getNews(Long id) {
        NewsArticle news = newsRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NEWS_NOT_EXISTED));
        news.setViews(news.getViews() + 1);
        news = newsRepository.save(news);
        return newsMapper.toNewsResponse(news);
    }

    public NewsResponse updateNews(Long id, NewsRequest request) {
        NewsArticle news = newsRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NEWS_NOT_EXISTED));

        newsMapper.updateNewsArticle(news, request);
        news = newsRepository.save(news);

        return newsMapper.toNewsResponse(news);
    }

    public void deleteNews(Long id) {
        if (!newsRepository.existsById(id)) {
            throw new AppException(ErrorCode.NEWS_NOT_EXISTED);
        }
        newsRepository.deleteById(id);
    }

    private PageResponse<NewsResponse> buildPageResponse(Page<NewsResponse> page) {
        return PageResponse.<NewsResponse>builder()
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