package com.sales.management.controller;

import com.sales.management.dto.response.AdminUserResponseDTO;
import com.sales.management.service.AdminUserService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public List<AdminUserResponseDTO> getAllUsers() {
        return adminUserService.getAllUsers();
    }
}
