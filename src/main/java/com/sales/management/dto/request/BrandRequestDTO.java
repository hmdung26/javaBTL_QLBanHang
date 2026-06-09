package com.sales.management.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BrandRequestDTO(
        @NotBlank @Size(max = 150) String name,
        @Size(max = 1000) String logoUrl,
        @Size(max = 2000) String description
) {
}
