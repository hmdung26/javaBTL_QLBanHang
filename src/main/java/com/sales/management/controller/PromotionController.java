package com.sales.management.controller;

import com.sales.management.dto.request.PromotionRequestDTO;
import com.sales.management.dto.response.PromotionResponseDTO;
import com.sales.management.service.BusinessFeatureService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/promotions")
@RequiredArgsConstructor
public class PromotionController {

    private final BusinessFeatureService service;

    @GetMapping
    public List<PromotionResponseDTO> getPromotions() {
        return service.getPromotions();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PromotionResponseDTO createPromotion(@Valid @RequestBody PromotionRequestDTO request) {
        return service.createPromotion(request);
    }

    @PutMapping("/{id}")
    public PromotionResponseDTO updatePromotion(
            @PathVariable Long id,
            @Valid @RequestBody PromotionRequestDTO request
    ) {
        return service.updatePromotion(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePromotion(@PathVariable Long id) {
        service.deletePromotion(id);
    }
}
