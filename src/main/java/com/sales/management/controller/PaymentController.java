package com.sales.management.controller;

import com.sales.management.dto.request.PaymentUpdateRequestDTO;
import com.sales.management.service.BusinessFeatureService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final BusinessFeatureService service;

    @PatchMapping("/orders/{orderId}")
    public void updatePayment(
            @PathVariable Long orderId,
            @Valid @RequestBody PaymentUpdateRequestDTO request
    ) {
        service.updatePayment(orderId, request);
    }
}
