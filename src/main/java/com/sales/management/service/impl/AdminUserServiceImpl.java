package com.sales.management.service.impl;

import com.sales.management.dto.response.AdminUserResponseDTO;
import com.sales.management.dto.response.AdminUserReviewResponseDTO;
import com.sales.management.dto.response.OrderResponseDTO;
import com.sales.management.entity.Product;
import com.sales.management.entity.ProductReview;
import com.sales.management.entity.User;
import com.sales.management.repository.ProductReviewRepository;
import com.sales.management.repository.UserRepository;
import com.sales.management.service.AdminUserService;
import com.sales.management.service.OrderService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {

    private final UserRepository userRepository;
    private final ProductReviewRepository productReviewRepository;
    private final OrderService orderService;

    @Override
    @Transactional(readOnly = true)
    public List<AdminUserResponseDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    private AdminUserResponseDTO toResponseDTO(User user) {
        List<OrderResponseDTO> orders = orderService.getMyOrders(user.getUsername());
        List<AdminUserReviewResponseDTO> reviews = productReviewRepository
                .findByUserUsernameOrderByCreatedAtDesc(user.getUsername())
                .stream()
                .map(this::toReviewResponseDTO)
                .toList();

        return AdminUserResponseDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .address(user.getAddress())
                .role(user.getRole())
                .orderCount(orders.size())
                .reviewCount(reviews.size())
                .orders(orders)
                .reviews(reviews)
                .build();
    }

    private AdminUserReviewResponseDTO toReviewResponseDTO(ProductReview review) {
        Product product = review.getProduct();

        return AdminUserReviewResponseDTO.builder()
                .id(review.getId())
                .productId(product != null ? product.getId() : null)
                .productName(product != null ? product.getName() : null)
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
