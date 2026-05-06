package com.sales.management.service.impl;

import com.sales.management.dto.request.BannerRequestDTO;
import com.sales.management.dto.response.BannerResponseDTO;
import com.sales.management.entity.Banner;
import com.sales.management.exception.ResourceNotFoundException;
import com.sales.management.repository.BannerRepository;
import com.sales.management.service.BannerService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BannerServiceImpl implements BannerService {

    private final BannerRepository bannerRepository;

    @Override
    public List<BannerResponseDTO> getActiveBanners() {
        return bannerRepository.findByActiveTrueOrderBySortOrderAsc()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Override
    public List<BannerResponseDTO> getAllBanners() {
        return bannerRepository.findAllByOrderBySortOrderAsc()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Override
    public BannerResponseDTO createBanner(BannerRequestDTO requestDTO) {
        Banner banner = Banner.builder()
                .title(requestDTO.getTitle())
                .subtitle(requestDTO.getSubtitle())
                .imageUrl(requestDTO.getImageUrl())
                .linkUrl(requestDTO.getLinkUrl())
                .active(requestDTO.isActive())
                .sortOrder(requestDTO.getSortOrder())
                .build();

        return toResponseDTO(bannerRepository.save(banner));
    }

    @Override
    public BannerResponseDTO updateBanner(Long id, BannerRequestDTO requestDTO) {
        Banner banner = findBannerById(id);
        banner.setTitle(requestDTO.getTitle());
        banner.setSubtitle(requestDTO.getSubtitle());
        banner.setImageUrl(requestDTO.getImageUrl());
        banner.setLinkUrl(requestDTO.getLinkUrl());
        banner.setActive(requestDTO.isActive());
        banner.setSortOrder(requestDTO.getSortOrder());

        return toResponseDTO(bannerRepository.save(banner));
    }

    @Override
    public void deleteBanner(Long id) {
        bannerRepository.delete(findBannerById(id));
    }

    private Banner findBannerById(Long id) {
        return bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Banner not found with id: " + id));
    }

    private BannerResponseDTO toResponseDTO(Banner banner) {
        return BannerResponseDTO.builder()
                .id(banner.getId())
                .title(banner.getTitle())
                .subtitle(banner.getSubtitle())
                .imageUrl(banner.getImageUrl())
                .linkUrl(banner.getLinkUrl())
                .active(banner.isActive())
                .sortOrder(banner.getSortOrder())
                .createdAt(banner.getCreatedAt())
                .build();
    }
}
