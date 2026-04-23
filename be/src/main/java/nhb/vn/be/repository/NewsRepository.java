package nhb.vn.be.repository;

import nhb.vn.be.entity.NewsArticle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NewsRepository extends JpaRepository<NewsArticle, Long> {
    Page<NewsArticle> findByFeaturedTrue(Pageable pageable);
    Page<NewsArticle> findByCategory(String category, Pageable pageable);
    Page<NewsArticle> findByTitleContainingIgnoreCaseOrExcerptContainingIgnoreCase(String title, String excerpt, Pageable pageable);
}
