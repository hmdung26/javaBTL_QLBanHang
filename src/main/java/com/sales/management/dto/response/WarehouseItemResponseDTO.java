package com.sales.management.dto.response;

import com.sales.management.entity.WarehouseStatus;
import java.time.LocalDateTime;

public record WarehouseItemResponseDTO(
        Long id,
        Long productId,
        String productName,
        String barcode,
        String serialNumber,
        String shelfLocation,
        WarehouseStatus status,
        Long reservedOrderId,
        LocalDateTime lastUpdated
) {
}
