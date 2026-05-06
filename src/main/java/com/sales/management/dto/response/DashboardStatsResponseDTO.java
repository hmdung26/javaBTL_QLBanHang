package com.sales.management.dto.response;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsResponseDTO {

    private long totalProducts;

    private long totalCategories;

    private long totalOrders;

    private long pendingOrders;

    private long lowStockProducts;

    private BigDecimal totalRevenue;
}
