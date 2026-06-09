package com.sales.management.dto.request;

import com.sales.management.entity.DiscountType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PromotionRequestDTO(
        @NotBlank String code,
        String name,
        @NotNull DiscountType discountType,
        @NotNull @DecimalMin("0.01") BigDecimal discountValue,
        @NotNull @DecimalMin("0.0") BigDecimal minOrderValue,
        @NotNull LocalDateTime startAt,
        @NotNull LocalDateTime endAt,
        @Min(1) int usageLimit,
        boolean active
) {
}
