package com.sales.management.dto.response;

import java.time.LocalDateTime;

public record BrandResponseDTO(
        Long id,
        String name,
        String logoUrl,
        String description,
        LocalDateTime createdAt
) {
}
