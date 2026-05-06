package com.sales.management.service.impl;

import com.sales.management.dto.request.ProductReviewRequestDTO;
import com.sales.management.dto.response.ProductReviewResponseDTO;
import com.sales.management.entity.Product;
import com.sales.management.entity.ProductReview;
import com.sales.management.entity.User;
import com.sales.management.exception.ResourceNotFoundException;
import com.sales.management.repository.ProductRepository;
import com.sales.management.repository.ProductReviewRepository;
import com.sales.management.repository.UserRepository;
import com.sales.management.service.ProductReviewService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductReviewServiceImpl implements ProductReviewService {

    private final ProductReviewRepository productReviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    public List<ProductReviewResponseDTO> getReviewsByProductId(Long productId) {
        return productReviewRepository.findByProductIdOrderByCreatedAtDesc(productId)
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Override
    public ProductReviewResponseDTO createReview(Long productId, ProductReviewRequestDTO requestDTO, String username) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        ProductReview review = ProductReview.builder()
                .product(product)
                .user(user)
                .rating(requestDTO.getRating())
                .comment(requestDTO.getComment())
                .build();

        return toResponseDTO(productReviewRepository.save(review));
    }

    @Override
    @Transactional
    public void deleteReview(Long productId, Long reviewId) {
        ProductReview review = productReviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));

        if (!review.getProduct().getId().equals(productId)) {
            throw new ResourceNotFoundException("Review not found for product id: " + productId);
        }

        productReviewRepository.delete(review);
    }

    private ProductReviewResponseDTO toResponseDTO(ProductReview review) {
        return ProductReviewResponseDTO.builder()
                .id(review.getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .username(review.getUser().getUsername())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
