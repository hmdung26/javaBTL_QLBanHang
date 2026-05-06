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
public class AdminUserReviewResponseDTO {

    private Long id;

    private Long productId;

    private String productName;

    private int rating;

    private String comment;

    private LocalDateTime createdAt;
}
