package com.sales.management.service;

import com.sales.management.dto.response.AdminUserResponseDTO;
import java.util.List;

public interface AdminUserService {

    List<AdminUserResponseDTO> getAllUsers();
}
