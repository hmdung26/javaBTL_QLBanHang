package com.sales.management.dto.response;

import com.sales.management.entity.UserRole;
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
public class UserProfileResponseDTO {

    private Long id;

    private String username;

    private String fullName;

    private String phone;

    private String address;

    private UserRole role;
}
