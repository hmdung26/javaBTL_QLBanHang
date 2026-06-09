package com.sales.management.controller;

import com.sales.management.dto.response.AdminUserResponseDTO;
import com.sales.management.dto.request.AdminUserRequestDTO;
import com.sales.management.dto.request.AdminUserUpdateRequestDTO;
import jakarta.validation.Valid;
import com.sales.management.service.AdminUserService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public List<AdminUserResponseDTO> getAllUsers() {
        return adminUserService.getAllUsers();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AdminUserResponseDTO createUser(@Valid @RequestBody AdminUserRequestDTO request) {
        return adminUserService.createUser(request);
    }

    @PutMapping("/{id}")
    public AdminUserResponseDTO updateUser(
            @PathVariable Long id,
            @Valid @RequestBody AdminUserUpdateRequestDTO request
    ) {
        return adminUserService.updateUser(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable Long id) {
        adminUserService.deleteUser(id);
    }
}
