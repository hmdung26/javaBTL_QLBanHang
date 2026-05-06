package com.sales.management.service;

import com.sales.management.dto.response.AiResponseDTO;

public interface AiService {

    AiResponseDTO chat(String message);

    AiResponseDTO generateDashboardReport();
}
