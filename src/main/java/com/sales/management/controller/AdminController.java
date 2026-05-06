package com.sales.management.controller;

import com.sales.management.dto.response.DashboardStatsResponseDTO;
import com.sales.management.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final DashboardService dashboardService;

    @GetMapping("/dashboard")
    public DashboardStatsResponseDTO getDashboardStats() {
        return dashboardService.getDashboardStats();
    }
}
