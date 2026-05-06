package com.sales.management.dto.request;

import jakarta.validation.constraints.NotBlank;
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
    private String title;

    private String subtitle;

    @NotBlank(message = "Banner image is required")
    private String imageUrl;

    private String linkUrl;

    private boolean active;

    private int sortOrder;
}
