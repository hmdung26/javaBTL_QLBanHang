package com.sales.management.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductRequestDTO {

    @NotBlank(message = "Product name is required")
    @Size(max = 255, message = "Product name must not exceed 255 characters")
    private String name;

    @Size(max = 500000, message = "Product description must not exceed 500000 characters")
    private String description;

    @Size(max = 500000, message = "Product specifications must not exceed 500000 characters")
    private String specifications;

    @NotNull(message = "Product price is required")
    @DecimalMin(value = "0.0", message = "Product price must be at least 0")
    private BigDecimal price;

    @Min(value = 0, message = "Stock quantity must be at least 0")
    private int stockQuantity;

    @Size(max = 1000, message = "Product image URL must not exceed 1000 characters")
    private String imageUrl;

    @Size(max = 20, message = "Product image list must not exceed 20 images")
    private List<@Size(max = 1000, message = "Product image URL must not exceed 1000 characters") String> imageUrls;

    @Size(max = 100, message = "Warranty period must not exceed 100 characters")
    private String warrantyPeriod;

    private Long categoryId;

    private Long brandId;
}
