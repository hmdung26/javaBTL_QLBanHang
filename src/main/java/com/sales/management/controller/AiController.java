package com.sales.management.controller;

import com.sales.management.dto.request.AiChatRequestDTO;
import com.sales.management.dto.response.AiResponseDTO;
import com.sales.management.service.AiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/chat")
    public AiResponseDTO chat(@Valid @RequestBody AiChatRequestDTO requestDTO) {
        return aiService.chat(requestDTO.getMessage());
    }

    @GetMapping("/admin-report")
    public AiResponseDTO generateDashboardReport() {
        return aiService.generateDashboardReport();
    }
}
