package com.sales.management.dto.request;

import com.sales.management.entity.UserRole;
import jakarta.validation.constraints.NotNull;

public record AdminUserUpdateRequestDTO(
        String password,
        String fullName,
        String phone,
        String address,
        @NotNull UserRole role
) {
}
