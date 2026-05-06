package com.sales.management.controller;

import com.sales.management.dto.response.MonthlyRevenueResponseDTO;
import com.sales.management.service.AdminReportService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/reports")
@RequiredArgsConstructor
public class AdminReportController {

    private final AdminReportService adminReportService;

    @GetMapping("/monthly-revenue")
    public List<MonthlyRevenueResponseDTO> getMonthlyRevenue() {
        return adminReportService.getMonthlyRevenue();
    }
}
