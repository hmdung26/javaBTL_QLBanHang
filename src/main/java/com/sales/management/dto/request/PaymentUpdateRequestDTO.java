package com.sales.management.dto.request;

import com.sales.management.entity.PaymentStatus;
import jakarta.validation.constraints.NotNull;

public record PaymentUpdateRequestDTO(
        @NotNull PaymentStatus status,
        String transactionCode
) {
}
