package com.sales.management.controller;

import com.sales.management.dto.request.ProductRequestDTO;
import com.sales.management.dto.response.ProductResponseDTO;
import com.sales.management.service.ProductService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponseDTO createProduct(@Valid @RequestBody ProductRequestDTO requestDTO) {
        return productService.createProduct(requestDTO);
    }

    @GetMapping
    public List<ProductResponseDTO> getAllProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long brandId,
            @RequestParam(required = false) Boolean inStock
    ) {
        return productService.getAllProducts(keyword, categoryId, brandId, inStock);
    }

    @GetMapping("/top-rated")
    public List<ProductResponseDTO> getTopRatedProducts(
            @RequestParam(defaultValue = "10") int limit
    ) {
        return productService.getTopRatedProducts(limit);
    }

    @GetMapping("/best-selling")
    public List<ProductResponseDTO> getBestSellingProducts(
            @RequestParam(defaultValue = "10") int limit
    ) {
        return productService.getBestSellingProducts(limit);
    }

    @GetMapping("/{id}")
    public ProductResponseDTO getProductById(@PathVariable Long id) {
        return productService.getProductById(id);
    }

    @PutMapping("/{id}")
    public ProductResponseDTO updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequestDTO requestDTO
    ) {
        return productService.updateProduct(id, requestDTO);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
    }
}
