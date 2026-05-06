package com.sales.management.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.sales.management.dto.response.AiResponseDTO;
import com.sales.management.dto.response.DashboardStatsResponseDTO;
import com.sales.management.entity.Product;
import com.sales.management.exception.BadRequestException;
import com.sales.management.repository.OrderRepository;
import com.sales.management.repository.ProductRepository;
import com.sales.management.service.AiService;
import com.sales.management.service.DashboardService;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
@RequiredArgsConstructor
public class GeminiAiServiceImpl implements AiService {

    private final RestClient.Builder restClientBuilder;
    private final DashboardService dashboardService;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    @Value("${app.gemini.api-key:}")
    private String apiKey;

    @Value("${app.gemini.model:gemini-2.5-flash}")
    private String model;

    @Value("${app.gemini.base-url:https://generativelanguage.googleapis.com}")
    private String baseUrl;

    @Override
    public AiResponseDTO chat(String message) {
        String productContext = productRepository.findAll()
                .stream()
                .limit(8)
                .map(product -> "- " + product.getName() + " | gia: " + product.getPrice()
                        + " | ton kho: " + product.getStockQuantity())
                .reduce("", (current, item) -> current + item + "\n");

        String prompt = """
                Ban la tro ly ban hang cua shop PC TTG SALES.
                Tra loi ngan gon bang tieng Viet, tu van nhu nhan vien ban hang.
                Neu khach hoi san pham, dua vao danh sach san pham hien co:
                %s

                Cau hoi cua khach: %s
                """.formatted(productContext, message);

        return AiResponseDTO.builder()
                .answer(callGemini(prompt))
                .build();
    }

    @Override
    public AiResponseDTO generateDashboardReport() {
        DashboardStatsResponseDTO stats = dashboardService.getDashboardStats();
        List<Product> lowStockProducts = productRepository.findAll()
                .stream()
                .filter(product -> product.getStockQuantity() <= 5)
                .limit(10)
                .toList();

        String lowStockContext = lowStockProducts.stream()
                .map(product -> "- " + product.getName() + ": " + product.getStockQuantity() + " san pham")
                .reduce("", (current, item) -> current + item + "\n");

        String prompt = """
                Ban la tro ly phan tich kinh doanh cho cua hang PC.
                Hay viet bao cao ngan gon bang tieng Viet, gom:
                1. Nhan dinh nhanh tinh hinh kinh doanh
                2. Rui ro can xu ly
                3. Viec nen lam tiep theo trong ngay

                So lieu:
                - Tong san pham: %d
                - Tong danh muc: %d
                - Tong don hang: %d
                - Don dang cho xu ly: %d
                - San pham sap het hang: %d
                - Doanh thu: %s
                - Tong so don trong he thong: %d

                San pham ton kho thap:
                %s
                """.formatted(
                stats.getTotalProducts(),
                stats.getTotalCategories(),
                stats.getTotalOrders(),
                stats.getPendingOrders(),
                stats.getLowStockProducts(),
                stats.getTotalRevenue(),
                orderRepository.count(),
                lowStockContext.isBlank() ? "Khong co" : lowStockContext
        );

        return AiResponseDTO.builder()
                .answer(callGemini(prompt))
                .build();
    }

    private String callGemini(String prompt) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new BadRequestException("Gemini API key is not configured");
        }

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(Map.of(
                        "parts", List.of(Map.of("text", prompt))
                ))
        );

        JsonNode response = restClientBuilder.build()
                .post()
                .uri(baseUrl + "/v1beta/models/" + model + ":generateContent?key=" + apiKey)
                .body(requestBody)
                .retrieve()
                .body(JsonNode.class);

        JsonNode textNode = response != null
                ? response.at("/candidates/0/content/parts/0/text")
                : null;

        if (textNode == null || textNode.isMissingNode() || textNode.asText().isBlank()) {
            throw new BadRequestException("Gemini did not return a valid response");
        }

        return textNode.asText();
    }
}
