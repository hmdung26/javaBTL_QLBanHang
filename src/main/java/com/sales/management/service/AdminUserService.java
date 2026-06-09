package com.sales.management.service;

import com.sales.management.dto.response.AdminUserResponseDTO;
import com.sales.management.dto.request.AdminUserRequestDTO;
import com.sales.management.dto.request.AdminUserUpdateRequestDTO;
import java.util.List;

public interface AdminUserService {

    List<AdminUserResponseDTO> getAllUsers();

    AdminUserResponseDTO createUser(AdminUserRequestDTO request);

    AdminUserResponseDTO updateUser(Long id, AdminUserUpdateRequestDTO request);

    void deleteUser(Long id);
}
