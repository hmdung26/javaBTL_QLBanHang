package com.sales.management.dto.response;

import java.time.LocalDateTime;

public record NotificationResponseDTO(
        Long id,
        String title,
        String message,
        boolean read,
        LocalDateTime createdAt
) {
}
