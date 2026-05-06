package com.sales.management.controller;

import com.sales.management.dto.request.BannerRequestDTO;
import com.sales.management.dto.response.BannerResponseDTO;
import com.sales.management.service.BannerService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/banners")
@RequiredArgsConstructor
public class BannerController {

    private final BannerService bannerService;

    @GetMapping
    public List<BannerResponseDTO> getBanners(
            @RequestParam(defaultValue = "true") boolean activeOnly
    ) {
        return activeOnly ? bannerService.getActiveBanners() : bannerService.getAllBanners();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BannerResponseDTO createBanner(@Valid @RequestBody BannerRequestDTO requestDTO) {
        return bannerService.createBanner(requestDTO);
    }

    @PutMapping("/{id}")
    public BannerResponseDTO updateBanner(
            @PathVariable Long id,
            @Valid @RequestBody BannerRequestDTO requestDTO
    ) {
        return bannerService.updateBanner(id, requestDTO);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBanner(@PathVariable Long id) {
        bannerService.deleteBanner(id);
    }
}
