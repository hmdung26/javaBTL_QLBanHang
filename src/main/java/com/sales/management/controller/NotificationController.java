package com.sales.management.controller;

import com.sales.management.dto.response.NotificationResponseDTO;
import com.sales.management.service.BusinessFeatureService;
import java.security.Principal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final BusinessFeatureService service;

    @GetMapping
    public List<NotificationResponseDTO> getNotifications(Principal principal) {
        return service.getNotifications(principal.getName());
    }

    @PatchMapping("/{id}/read")
    public void markRead(@PathVariable Long id, Principal principal) {
        service.markNotificationRead(id, principal.getName());
    }
}
