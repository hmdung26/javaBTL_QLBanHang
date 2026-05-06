package com.sales.management.controller;

import com.sales.management.dto.request.ProductReviewRequestDTO;
import com.sales.management.dto.response.ProductReviewResponseDTO;
import com.sales.management.service.ProductReviewService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/products/{productId}/reviews")
@RequiredArgsConstructor
public class ProductReviewController {

    private final ProductReviewService productReviewService;

    @GetMapping
    public List<ProductReviewResponseDTO> getProductReviews(@PathVariable Long productId) {
        return productReviewService.getReviewsByProductId(productId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductReviewResponseDTO createReview(
            @PathVariable Long productId,
            @Valid @RequestBody ProductReviewRequestDTO requestDTO,
            Principal principal
    ) {
        return productReviewService.createReview(productId, requestDTO, principal.getName());
    }

    @DeleteMapping("/{reviewId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteReview(@PathVariable Long productId, @PathVariable Long reviewId) {
        productReviewService.deleteReview(productId, reviewId);
    }
}
