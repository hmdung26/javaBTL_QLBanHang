package com.sales.management.dto.response;

import com.sales.management.entity.DiscountType;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PromotionResponseDTO(
        Long id,
        String code,
        String name,
        DiscountType discountType,
        BigDecimal discountValue,
        BigDecimal minOrderValue,
        LocalDateTime startAt,
        LocalDateTime endAt,
        int usageLimit,
        int usedCount,
        boolean active
) {
}
