package com.sales.management.service;

import com.sales.management.dto.request.ProductReviewRequestDTO;
import com.sales.management.dto.response.ProductReviewResponseDTO;
import java.util.List;

public interface ProductReviewService {

    List<ProductReviewResponseDTO> getReviewsByProductId(Long productId);

    ProductReviewResponseDTO createReview(Long productId, ProductReviewRequestDTO requestDTO, String username);

    void deleteReview(Long productId, Long reviewId);
}
