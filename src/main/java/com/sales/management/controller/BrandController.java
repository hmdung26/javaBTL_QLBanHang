package com.sales.management.controller;

import com.sales.management.dto.request.BrandRequestDTO;
import com.sales.management.dto.response.BrandResponseDTO;
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
@RequestMapping("/api/v1/brands")
@RequiredArgsConstructor
public class BrandController {

    private final BusinessFeatureService service;

    @GetMapping
    public List<BrandResponseDTO> getBrands() {
        return service.getBrands();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BrandResponseDTO createBrand(@Valid @RequestBody BrandRequestDTO request) {
        return service.createBrand(request);
    }

    @PutMapping("/{id}")
    public BrandResponseDTO updateBrand(@PathVariable Long id, @Valid @RequestBody BrandRequestDTO request) {
        return service.updateBrand(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBrand(@PathVariable Long id) {
        service.deleteBrand(id);
    }
}
