package com.sales.management.service.impl;

import com.sales.management.dto.response.DashboardStatsResponseDTO;
import com.sales.management.entity.OrderStatus;
import com.sales.management.repository.CategoryRepository;
import com.sales.management.repository.OrderRepository;
import com.sales.management.repository.ProductRepository;
import com.sales.management.service.DashboardService;
import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private static final int LOW_STOCK_THRESHOLD = 5;

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final OrderRepository orderRepository;

    @Override
    public DashboardStatsResponseDTO getDashboardStats() {
        return DashboardStatsResponseDTO.builder()
                .totalProducts(productRepository.count())
                .totalCategories(categoryRepository.count())
                .totalOrders(orderRepository.count())
                .pendingOrders(orderRepository.countByStatus(OrderStatus.PENDING))
                .lowStockProducts(productRepository.countByStockQuantityLessThanEqual(LOW_STOCK_THRESHOLD))
                .totalRevenue(orderRepository.sumRevenueByCompletedStatuses()
                        .orElse(BigDecimal.ZERO))
                .build();
    }
}
