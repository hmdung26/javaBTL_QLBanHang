package com.sales.management.service.impl;

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
import com.sales.management.dto.response.WarrantyHistoryResponseDTO;
import com.sales.management.dto.response.WarrantyResponseDTO;
import com.sales.management.entity.Brand;
import com.sales.management.entity.Notification;
import com.sales.management.entity.Order;
import com.sales.management.entity.Payment;
import com.sales.management.entity.PaymentStatus;
import com.sales.management.entity.Product;
import com.sales.management.entity.Promotion;
import com.sales.management.entity.User;
import com.sales.management.entity.WarehouseItem;
import com.sales.management.entity.WarehouseStatus;
import com.sales.management.entity.Warranty;
import com.sales.management.entity.WarrantyHistory;
import com.sales.management.entity.WarrantyStatus;
import com.sales.management.exception.BadRequestException;
import com.sales.management.exception.ResourceNotFoundException;
import com.sales.management.repository.BrandRepository;
import com.sales.management.repository.NotificationRepository;
import com.sales.management.repository.OrderRepository;
import com.sales.management.repository.PaymentRepository;
import com.sales.management.repository.ProductRepository;
import com.sales.management.repository.PromotionRepository;
import com.sales.management.repository.UserRepository;
import com.sales.management.repository.WarehouseItemRepository;
import com.sales.management.repository.WarrantyRepository;
import com.sales.management.service.BusinessFeatureService;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class BusinessFeatureServiceImpl implements BusinessFeatureService {

    private final BrandRepository brandRepository;
    private final PromotionRepository promotionRepository;
    private final WarehouseItemRepository warehouseItemRepository;
    private final ProductRepository productRepository;
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final WarrantyRepository warrantyRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    @Override
    @Transactional(readOnly = true)
    public List<BrandResponseDTO> getBrands() {
        return brandRepository.findAll().stream().map(this::toBrandResponse).toList();
    }

    @Override
    public BrandResponseDTO createBrand(BrandRequestDTO request) {
        Brand brand = Brand.builder()
                .name(request.name().trim())
                .logoUrl(request.logoUrl())
                .description(request.description())
                .build();
        return toBrandResponse(brandRepository.save(brand));
    }

    @Override
    public BrandResponseDTO updateBrand(Long id, BrandRequestDTO request) {
        Brand brand = findBrand(id);
        brand.setName(request.name().trim());
        brand.setLogoUrl(request.logoUrl());
        brand.setDescription(request.description());
        return toBrandResponse(brandRepository.save(brand));
    }

    @Override
    public void deleteBrand(Long id) {
        Brand brand = findBrand(id);
        brand.getProducts().forEach(product -> product.setBrand(null));
        brandRepository.delete(brand);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PromotionResponseDTO> getPromotions() {
        return promotionRepository.findAll().stream().map(this::toPromotionResponse).toList();
    }

    @Override
    public PromotionResponseDTO createPromotion(PromotionRequestDTO request) {
        validatePromotion(request);
        Promotion promotion = Promotion.builder()
                .code(request.code().trim().toUpperCase())
                .name(request.name())
                .discountType(request.discountType())
                .discountValue(request.discountValue())
                .minOrderValue(request.minOrderValue())
                .startAt(request.startAt())
                .endAt(request.endAt())
                .usageLimit(request.usageLimit())
                .usedCount(0)
                .active(request.active())
                .build();
        return toPromotionResponse(promotionRepository.save(promotion));
    }

    @Override
    public PromotionResponseDTO updatePromotion(Long id, PromotionRequestDTO request) {
        validatePromotion(request);
        Promotion promotion = findPromotion(id);
        promotion.setCode(request.code().trim().toUpperCase());
        promotion.setName(request.name());
        promotion.setDiscountType(request.discountType());
        promotion.setDiscountValue(request.discountValue());
        promotion.setMinOrderValue(request.minOrderValue());
        promotion.setStartAt(request.startAt());
        promotion.setEndAt(request.endAt());
        promotion.setUsageLimit(request.usageLimit());
        promotion.setActive(request.active());
        return toPromotionResponse(promotionRepository.save(promotion));
    }

    @Override
    public void deletePromotion(Long id) {
        promotionRepository.delete(findPromotion(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<WarehouseItemResponseDTO> getWarehouseItems() {
        return warehouseItemRepository.findAll().stream()
                .sorted(Comparator.comparing(WarehouseItem::getId).reversed())
                .map(this::toWarehouseResponse)
                .toList();
    }

    @Override
    public WarehouseItemResponseDTO createWarehouseItem(WarehouseItemRequestDTO request) {
        Product product = findProduct(request.productId());
        WarehouseItem item = WarehouseItem.builder()
                .product(product)
                .barcode(request.barcode().trim())
                .serialNumber(request.serialNumber().trim())
                .shelfLocation(request.shelfLocation().trim())
                .status(request.status())
                .build();
        WarehouseItem saved = warehouseItemRepository.save(item);
        synchronizeAvailableStock(product);
        return toWarehouseResponse(saved);
    }

    @Override
    public WarehouseItemResponseDTO updateWarehouseItem(Long id, WarehouseItemRequestDTO request) {
        WarehouseItem item = findWarehouseItem(id);
        Product oldProduct = item.getProduct();
        item.setProduct(findProduct(request.productId()));
        item.setBarcode(request.barcode().trim());
        item.setSerialNumber(request.serialNumber().trim());
        item.setShelfLocation(request.shelfLocation().trim());
        item.setStatus(request.status());
        if (request.status() != WarehouseStatus.RESERVED) {
            item.setReservedOrder(null);
        }
        WarehouseItem saved = warehouseItemRepository.save(item);
        synchronizeAvailableStock(oldProduct);
        synchronizeAvailableStock(saved.getProduct());
        return toWarehouseResponse(saved);
    }

    @Override
    public void deleteWarehouseItem(Long id) {
        WarehouseItem item = findWarehouseItem(id);
        Product product = item.getProduct();
        warehouseItemRepository.delete(item);
        warehouseItemRepository.flush();
        synchronizeAvailableStock(product);
    }

    @Override
    public void updatePayment(Long orderId, PaymentUpdateRequestDTO request) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order: " + orderId));
        payment.setStatus(request.status());
        payment.setTransactionCode(request.transactionCode() == null || request.transactionCode().isBlank()
                ? null
                : request.transactionCode().trim());
        payment.setPaidAt(request.status() == PaymentStatus.PAID ? LocalDateTime.now() : null);
        paymentRepository.save(payment);
        notifyOrder(payment.getOrder(), "Cập nhật thanh toán",
                "Thanh toán đơn #" + orderId + " chuyển sang " + request.status());
    }

    @Override
    @Transactional(readOnly = true)
    public List<WarrantyResponseDTO> getWarranties(String username, boolean admin) {
        List<Warranty> warranties = admin
                ? warrantyRepository.findAll()
                : warrantyRepository.findByUserUsernameOrderByCreatedAtDesc(username);
        return warranties.stream().map(this::toWarrantyResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public WarrantyResponseDTO lookupWarranty(String serialNumber) {
        return toWarrantyResponse(findWarrantyBySerial(serialNumber));
    }

    @Override
    public WarrantyResponseDTO requestWarranty(String username, WarrantyRequestDTO request) {
        User user = findUser(username);
        Warranty warranty = findWarrantyBySerial(request.serialNumber());
        if (warranty.getUser() == null || !warranty.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Warranty does not belong to current user");
        }
        if (warranty.getEndDate().isBefore(LocalDate.now())) {
            warranty.setStatus(WarrantyStatus.EXPIRED);
            throw new BadRequestException("Warranty has expired");
        }
        appendWarrantyHistory(warranty, WarrantyStatus.REQUESTED, request.note());
        return toWarrantyResponse(warrantyRepository.save(warranty));
    }

    @Override
    public WarrantyResponseDTO updateWarranty(Long id, WarrantyUpdateRequestDTO request) {
        Warranty warranty = warrantyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warranty not found with id: " + id));
        appendWarrantyHistory(warranty, request.status(), request.note());
        if (request.replacementSerialNumber() != null && !request.replacementSerialNumber().isBlank()) {
            warranty.setSerialNumber(request.replacementSerialNumber().trim());
        }
        if (warranty.getWarehouseItem() != null) {
            warranty.getWarehouseItem().setStatus(
                    request.status() == WarrantyStatus.COMPLETED || request.status() == WarrantyStatus.REPLACED
                            ? WarehouseStatus.SOLD
                            : WarehouseStatus.WARRANTY
            );
        }
        Warranty saved = warrantyRepository.save(warranty);
        if (saved.getUser() != null) {
            notificationRepository.save(Notification.builder()
                    .user(saved.getUser())
                    .title("Tiến độ bảo hành")
                    .message("Phiếu bảo hành " + saved.getSerialNumber() + " chuyển sang " + saved.getStatus())
                    .read(false)
                    .build());
        }
        return toWarrantyResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponseDTO> getNotifications(String username) {
        return notificationRepository.findByUserUsernameOrderByCreatedAtDesc(username)
                .stream()
                .map(item -> new NotificationResponseDTO(
                        item.getId(), item.getTitle(), item.getMessage(), item.isRead(), item.getCreatedAt()))
                .toList();
    }

    @Override
    public void markNotificationRead(Long id, String username) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
        if (!notification.getUser().getUsername().equals(username)) {
            throw new BadRequestException("Notification does not belong to current user");
        }
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    private void validatePromotion(PromotionRequestDTO request) {
        if (!request.endAt().isAfter(request.startAt())) {
            throw new BadRequestException("Promotion end time must be after start time");
        }
        if (request.discountType().name().equals("PERCENT")
                && request.discountValue().doubleValue() > 100) {
            throw new BadRequestException("Percent discount cannot exceed 100");
        }
    }

    private void appendWarrantyHistory(Warranty warranty, WarrantyStatus status, String note) {
        warranty.setStatus(status);
        warranty.setNote(note);
        warranty.getHistory().add(WarrantyHistory.builder()
                .warranty(warranty)
                .status(status)
                .note(note)
                .build());
    }

    private void synchronizeAvailableStock(Product product) {
        product.setStockQuantity((int) warehouseItemRepository
                .countByProductIdAndStatus(product.getId(), WarehouseStatus.AVAILABLE));
        productRepository.save(product);
    }

    private void notifyOrder(Order order, String title, String message) {
        if (order.getUser() != null) {
            notificationRepository.save(Notification.builder()
                    .user(order.getUser())
                    .title(title)
                    .message(message)
                    .read(false)
                    .build());
        }
    }

    private Brand findBrand(Long id) {
        return brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + id));
    }

    private Promotion findPromotion(Long id) {
        return promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion not found with id: " + id));
    }

    private Product findProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    private WarehouseItem findWarehouseItem(Long id) {
        return warehouseItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse item not found with id: " + id));
    }

    private Warranty findWarrantyBySerial(String serialNumber) {
        return warrantyRepository.findBySerialNumberIgnoreCase(serialNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Warranty not found for serial: " + serialNumber));
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    private BrandResponseDTO toBrandResponse(Brand brand) {
        return new BrandResponseDTO(
                brand.getId(), brand.getName(), brand.getLogoUrl(), brand.getDescription(), brand.getCreatedAt());
    }

    private PromotionResponseDTO toPromotionResponse(Promotion promotion) {
        return new PromotionResponseDTO(
                promotion.getId(), promotion.getCode(), promotion.getName(), promotion.getDiscountType(),
                promotion.getDiscountValue(), promotion.getMinOrderValue(), promotion.getStartAt(),
                promotion.getEndAt(), promotion.getUsageLimit(), promotion.getUsedCount(), promotion.isActive());
    }

    private WarehouseItemResponseDTO toWarehouseResponse(WarehouseItem item) {
        return new WarehouseItemResponseDTO(
                item.getId(), item.getProduct().getId(), item.getProduct().getName(), item.getBarcode(),
                item.getSerialNumber(), item.getShelfLocation(), item.getStatus(),
                item.getReservedOrder() != null ? item.getReservedOrder().getId() : null, item.getLastUpdated());
    }

    private WarrantyResponseDTO toWarrantyResponse(Warranty warranty) {
        String productName = warranty.getOrderItem() != null && warranty.getOrderItem().getProduct() != null
                ? warranty.getOrderItem().getProduct().getName()
                : warranty.getWarehouseItem() != null ? warranty.getWarehouseItem().getProduct().getName() : null;
        return new WarrantyResponseDTO(
                warranty.getId(), warranty.getSerialNumber(), productName,
                warranty.getUser() != null ? warranty.getUser().getUsername() : null,
                warranty.getStartDate(), warranty.getEndDate(), warranty.getStatus(), warranty.getNote(),
                warranty.getHistory().stream()
                        .sorted(Comparator.comparing(WarrantyHistory::getCreatedAt))
                        .map(item -> new WarrantyHistoryResponseDTO(
                                item.getStatus(), item.getNote(), item.getCreatedAt()))
                        .toList()
        );
    }
}
