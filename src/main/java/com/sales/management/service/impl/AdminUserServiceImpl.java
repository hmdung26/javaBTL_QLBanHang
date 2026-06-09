package com.sales.management.service.impl;

import com.sales.management.dto.response.AdminUserResponseDTO;
import com.sales.management.dto.response.AdminUserReviewResponseDTO;
import com.sales.management.dto.response.OrderResponseDTO;
import com.sales.management.dto.request.AdminUserRequestDTO;
import com.sales.management.dto.request.AdminUserUpdateRequestDTO;
import com.sales.management.entity.Product;
import com.sales.management.entity.ProductReview;
import com.sales.management.entity.User;
import com.sales.management.repository.ProductReviewRepository;
import com.sales.management.repository.UserRepository;
import com.sales.management.exception.BadRequestException;
import com.sales.management.exception.ResourceNotFoundException;
import com.sales.management.service.AdminUserService;
import com.sales.management.service.OrderService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {

    private final UserRepository userRepository;
    private final ProductReviewRepository productReviewRepository;
    private final OrderService orderService;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public List<AdminUserResponseDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Override
    @Transactional
    public AdminUserResponseDTO createUser(AdminUserRequestDTO request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new BadRequestException("Username already exists");
        }
        User user = User.builder()
                .username(request.username())
                .password(passwordEncoder.encode(request.password()))
                .fullName(request.fullName())
                .phone(request.phone())
                .address(request.address())
                .role(request.role())
                .build();
        return toResponseDTO(userRepository.save(user));
    }

    @Override
    @Transactional
    public AdminUserResponseDTO updateUser(Long id, AdminUserUpdateRequestDTO request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        if (request.password() != null && !request.password().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.password()));
        }
        user.setFullName(request.fullName());
        user.setPhone(request.phone());
        user.setAddress(request.address());
        user.setRole(request.role());
        return toResponseDTO(userRepository.save(user));
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        if (!orderService.getMyOrders(user.getUsername()).isEmpty()) {
            throw new BadRequestException("Cannot delete user with order history");
        }
        userRepository.delete(user);
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
