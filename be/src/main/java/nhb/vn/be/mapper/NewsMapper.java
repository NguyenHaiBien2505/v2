package nhb.vn.be.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import nhb.vn.be.dto.request.NewsRequest;
import nhb.vn.be.dto.response.NewsResponse;
import nhb.vn.be.entity.NewsArticle;

@Mapper(componentModel = "spring")
public interface NewsMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "views", ignore = true)
    NewsArticle toNewsArticle(NewsRequest request);

    NewsResponse toNewsResponse(NewsArticle newsArticle);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "views", ignore = true)
    void updateNewsArticle(@MappingTarget NewsArticle newsArticle, NewsRequest request);
}
