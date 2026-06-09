package com.sales.management.controller;

import com.sales.management.dto.request.WarrantyRequestDTO;
import com.sales.management.dto.request.WarrantyUpdateRequestDTO;
import com.sales.management.dto.response.WarrantyResponseDTO;
import com.sales.management.service.BusinessFeatureService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/warranties")
@RequiredArgsConstructor
public class WarrantyController {

    private final BusinessFeatureService service;

    @GetMapping
    public List<WarrantyResponseDTO> getWarranties(Principal principal, Authentication authentication) {
        boolean admin = authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN")
                        || authority.getAuthority().equals("ROLE_STAFF"));
        return service.getWarranties(principal.getName(), admin);
    }

    @GetMapping("/lookup")
    public WarrantyResponseDTO lookup(@RequestParam String serialNumber) {
        return service.lookupWarranty(serialNumber);
    }

    @PostMapping("/requests")
    public WarrantyResponseDTO requestWarranty(
            Principal principal,
            @Valid @RequestBody WarrantyRequestDTO request
    ) {
        return service.requestWarranty(principal.getName(), request);
    }

    @PatchMapping("/{id}")
    public WarrantyResponseDTO updateWarranty(
            @PathVariable Long id,
            @Valid @RequestBody WarrantyUpdateRequestDTO request
    ) {
        return service.updateWarranty(id, request);
    }
}
