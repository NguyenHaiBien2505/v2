package nhb.vn.be.mapper;


import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import nhb.vn.be.dto.request.BannerRequest;
import nhb.vn.be.dto.response.BannerResponse;
import nhb.vn.be.entity.BannerEntity;

@Mapper(componentModel = "spring")
public interface BannerMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    BannerEntity toBannerEntity(BannerRequest request);

    BannerResponse toBannerResponse(BannerEntity bannerEntity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    void updateBanner(@MappingTarget BannerEntity bannerEntity, BannerRequest request);
}