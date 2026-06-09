package com.sales.management.dto.request;

import com.sales.management.entity.WarehouseStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record WarehouseItemRequestDTO(
        @NotNull Long productId,
        @NotBlank String barcode,
        @NotBlank String serialNumber,
        @NotBlank String shelfLocation,
        @NotNull WarehouseStatus status
) {
}
