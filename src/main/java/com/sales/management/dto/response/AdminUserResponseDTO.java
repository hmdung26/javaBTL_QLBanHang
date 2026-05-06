package com.sales.management.dto.response;

import com.sales.management.entity.UserRole;
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
public class AdminUserResponseDTO {

    private Long id;

    private String username;

    private String fullName;

    private String phone;

    private String address;

    private UserRole role;

    private long orderCount;

    private long reviewCount;

    private List<OrderResponseDTO> orders;

    private List<AdminUserReviewResponseDTO> reviews;
}
