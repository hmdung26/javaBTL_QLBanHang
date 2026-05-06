package com.sales.management.dto.response;

import java.time.LocalDateTime;
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
public class BannerResponseDTO {

    private Long id;

    private String title;

    private String subtitle;

    private String imageUrl;

    private String linkUrl;

    private boolean active;

    private int sortOrder;

    private LocalDateTime createdAt;
}
