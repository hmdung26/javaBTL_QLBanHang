package com.sales.management.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
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
public class BannerRequestDTO {

    @NotBlank(message = "Banner title is required")
    @Size(max = 255, message = "Banner title must not exceed 255 characters")
    private String title;

    @Size(max = 500, message = "Banner subtitle must not exceed 500 characters")
    private String subtitle;

    @NotBlank(message = "Banner image is required")
    @Size(max = 1000, message = "Banner image URL must not exceed 1000 characters")
    private String imageUrl;

    @Size(max = 1000, message = "Banner link URL must not exceed 1000 characters")
    private String linkUrl;

    private boolean active;

    @Min(value = 0, message = "Sort order must be at least 0")
    private int sortOrder;
}
