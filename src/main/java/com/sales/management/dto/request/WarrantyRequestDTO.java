package com.sales.management.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record WarrantyRequestDTO(
        @NotBlank String serialNumber,
        @Size(max = 3000) String note
) {
}
