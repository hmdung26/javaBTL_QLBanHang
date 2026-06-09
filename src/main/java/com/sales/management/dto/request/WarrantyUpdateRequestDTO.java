package com.sales.management.dto.request;

import com.sales.management.entity.WarrantyStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record WarrantyUpdateRequestDTO(
        @NotNull WarrantyStatus status,
        @Size(max = 3000) String note,
        String replacementSerialNumber
) {
}
