package com.sales.management.controller;

import com.sales.management.dto.request.WarehouseItemRequestDTO;
import com.sales.management.dto.response.WarehouseItemResponseDTO;
import com.sales.management.service.BusinessFeatureService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/warehouse")
@RequiredArgsConstructor
public class WarehouseController {

    private final BusinessFeatureService service;

    @GetMapping
    public List<WarehouseItemResponseDTO> getItems() {
        return service.getWarehouseItems();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WarehouseItemResponseDTO createItem(@Valid @RequestBody WarehouseItemRequestDTO request) {
        return service.createWarehouseItem(request);
    }

    @PutMapping("/{id}")
    public WarehouseItemResponseDTO updateItem(
            @PathVariable Long id,
            @Valid @RequestBody WarehouseItemRequestDTO request
    ) {
        return service.updateWarehouseItem(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteItem(@PathVariable Long id) {
        service.deleteWarehouseItem(id);
    }
}
