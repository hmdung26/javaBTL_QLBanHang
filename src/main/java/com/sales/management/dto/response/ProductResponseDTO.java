package com.sales.management.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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
public class ProductResponseDTO {

    private Long id;

    private String name;

    private String description;

    private String specifications;

    private BigDecimal price;

    private int stockQuantity;

    private String imageUrl;

    private String warrantyPeriod;

    private LocalDateTime createdAt;

    private Long categoryId;

    private String categoryName;

    private double averageRating;

    private long reviewCount;

    private long purchaseCount;
}
