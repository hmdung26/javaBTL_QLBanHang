package com.sales.management.service;

import com.sales.management.dto.request.BannerRequestDTO;
import com.sales.management.dto.response.BannerResponseDTO;
import java.util.List;

public interface BannerService {

    List<BannerResponseDTO> getActiveBanners();

    List<BannerResponseDTO> getAllBanners();

    BannerResponseDTO createBanner(BannerRequestDTO requestDTO);

    BannerResponseDTO updateBanner(Long id, BannerRequestDTO requestDTO);

    void deleteBanner(Long id);
}
