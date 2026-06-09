package com.sales.management.dto.response;

import com.sales.management.entity.WarrantyStatus;
import java.time.LocalDateTime;

public record WarrantyHistoryResponseDTO(
        WarrantyStatus status,
        String note,
        LocalDateTime createdAt
) {
}
