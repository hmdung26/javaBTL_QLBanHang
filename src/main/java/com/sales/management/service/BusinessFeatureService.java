package com.sales.management.service;

import com.sales.management.dto.request.BrandRequestDTO;
import com.sales.management.dto.request.PaymentUpdateRequestDTO;
import com.sales.management.dto.request.PromotionRequestDTO;
import com.sales.management.dto.request.WarehouseItemRequestDTO;
import com.sales.management.dto.request.WarrantyRequestDTO;
import com.sales.management.dto.request.WarrantyUpdateRequestDTO;
import com.sales.management.dto.response.BrandResponseDTO;
import com.sales.management.dto.response.NotificationResponseDTO;
import com.sales.management.dto.response.PromotionResponseDTO;
import com.sales.management.dto.response.WarehouseItemResponseDTO;
import com.sales.management.dto.response.WarrantyResponseDTO;
import java.util.List;

public interface BusinessFeatureService {

    List<BrandResponseDTO> getBrands();

    BrandResponseDTO createBrand(BrandRequestDTO request);

    BrandResponseDTO updateBrand(Long id, BrandRequestDTO request);

    void deleteBrand(Long id);

    List<PromotionResponseDTO> getPromotions();

    PromotionResponseDTO createPromotion(PromotionRequestDTO request);

    PromotionResponseDTO updatePromotion(Long id, PromotionRequestDTO request);

    void deletePromotion(Long id);

    List<WarehouseItemResponseDTO> getWarehouseItems();

    WarehouseItemResponseDTO createWarehouseItem(WarehouseItemRequestDTO request);

    WarehouseItemResponseDTO updateWarehouseItem(Long id, WarehouseItemRequestDTO request);

    void deleteWarehouseItem(Long id);

    void updatePayment(Long orderId, PaymentUpdateRequestDTO request);

    List<WarrantyResponseDTO> getWarranties(String username, boolean admin);

    WarrantyResponseDTO lookupWarranty(String serialNumber);

    WarrantyResponseDTO requestWarranty(String username, WarrantyRequestDTO request);

    WarrantyResponseDTO updateWarranty(Long id, WarrantyUpdateRequestDTO request);

    List<NotificationResponseDTO> getNotifications(String username);

    void markNotificationRead(Long id, String username);
}
