package com.sales.management.dto.request;

import com.sales.management.entity.UserRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AdminUserRequestDTO(
        @NotBlank @Size(min = 3, max = 50) String username,
        @NotBlank @Size(min = 6, max = 100) String password,
        String fullName,
        String phone,
        String address,
        @NotNull UserRole role
) {
}
