package com.sales.management.service.impl;

import com.sales.management.dto.response.MonthlyRevenueResponseDTO;
import com.sales.management.repository.OrderRepository;
import com.sales.management.service.AdminReportService;
import java.math.BigDecimal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminReportServiceImpl implements AdminReportService {

    private final OrderRepository orderRepository;

    @Override
    @Transactional(readOnly = true)
    public List<MonthlyRevenueResponseDTO> getMonthlyRevenue() {
        return orderRepository.findMonthlyRevenue()
                .stream()
                .map(row -> MonthlyRevenueResponseDTO.builder()
                        .year(((Number) row[0]).intValue())
                        .month(((Number) row[1]).intValue())
                        .revenue((BigDecimal) row[2])
                        .orderCount(((Number) row[3]).longValue())
                        .build())
                .toList();
    }
}
