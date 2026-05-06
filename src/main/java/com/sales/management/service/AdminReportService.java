package com.sales.management.service;

import com.sales.management.dto.response.MonthlyRevenueResponseDTO;
import java.util.List;

public interface AdminReportService {

    List<MonthlyRevenueResponseDTO> getMonthlyRevenue();
}
