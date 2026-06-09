package com.sales.management.dto.response;

import com.sales.management.entity.WarrantyStatus;
import java.time.LocalDate;
import java.util.List;

public record WarrantyResponseDTO(
        Long id,
        String serialNumber,
        String productName,
        String username,
        LocalDate startDate,
        LocalDate endDate,
        WarrantyStatus status,
        String note,
        List<WarrantyHistoryResponseDTO> history
) {
}
