package com.sales.management.service.impl;

import com.sales.management.dto.request.OrderItemRequestDTO;
import com.sales.management.dto.request.OrderRequestDTO;
import com.sales.management.dto.response.OrderItemResponseDTO;
import com.sales.management.dto.response.OrderResponseDTO;
import com.sales.management.entity.Order;
import com.sales.management.entity.OrderItem;
import com.sales.management.entity.OrderStatus;
import com.sales.management.entity.DiscountType;
import com.sales.management.entity.Invoice;
import com.sales.management.entity.Notification;
import com.sales.management.entity.Payment;
import com.sales.management.entity.PaymentMethod;
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
import com.sales.management.repository.OrderRepository;
import com.sales.management.repository.InvoiceRepository;
import com.sales.management.repository.NotificationRepository;
import com.sales.management.repository.PaymentRepository;
import com.sales.management.repository.ProductRepository;
import com.sales.management.repository.PromotionRepository;
import com.sales.management.repository.UserRepository;
import com.sales.management.repository.WarehouseItemRepository;
import com.sales.management.repository.WarrantyRepository;
import com.sales.management.service.OrderService;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final PromotionRepository promotionRepository;
    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final WarehouseItemRepository warehouseItemRepository;
    private final WarrantyRepository warrantyRepository;
    private final NotificationRepository notificationRepository;

    @Override
    @Transactional
    public OrderResponseDTO createOrder(OrderRequestDTO requestDTO) {
        return createOrder(requestDTO, null);
    }

    @Override
    @Transactional
    public OrderResponseDTO createOrder(OrderRequestDTO requestDTO, String username) {
        Order order = Order.builder()
                .customerName(requestDTO.getCustomerName())
                .customerPhone(requestDTO.getCustomerPhone())
                .customerAddress(requestDTO.getCustomerAddress())
                .status(OrderStatus.PENDING)
                .totalAmount(BigDecimal.ZERO)
                .subTotal(BigDecimal.ZERO)
                .discountAmount(BigDecimal.ZERO)
                .build();

        if (username == null || username.isBlank()) {
            throw new BadRequestException("You must log in before placing an order");
        }
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        order.setUser(user);

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal subTotal = BigDecimal.ZERO;

        for (OrderItemRequestDTO itemRequest : requestDTO.getItems()) {
            Product product = findProductById(itemRequest.getProductId());
            ensureLegacyWarehouseItems(product);

            if (product.getStockQuantity() < itemRequest.getQuantity()) {
                throw new BadRequestException("Insufficient stock for product id: " + product.getId());
            }

            BigDecimal price = product.getPrice();
            BigDecimal itemSubTotal = price.multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            subTotal = subTotal.add(itemSubTotal);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(itemRequest.getQuantity())
                    .price(price)
                    .subTotal(itemSubTotal)
                    .build();

            orderItems.add(orderItem);
        }

        Promotion promotion = resolvePromotion(requestDTO.getPromotionCode(), subTotal);
        BigDecimal discountAmount = calculateDiscount(promotion, subTotal);
        BigDecimal totalAmount = subTotal.subtract(discountAmount).max(BigDecimal.ZERO);
        order.setOrderItems(orderItems);
        order.setSubTotal(subTotal);
        order.setDiscountAmount(discountAmount);
        order.setTotalAmount(totalAmount);
        order.setPromotion(promotion);

        Order savedOrder = orderRepository.save(order);
        reserveWarehouseItems(savedOrder);

        PaymentMethod paymentMethod = requestDTO.getPaymentMethod() != null
                ? requestDTO.getPaymentMethod()
                : PaymentMethod.COD;
        PaymentStatus paymentStatus = paymentMethod == PaymentMethod.COD
                ? PaymentStatus.PENDING
                : requestDTO.getTransactionCode() != null && !requestDTO.getTransactionCode().isBlank()
                        ? PaymentStatus.PAID
                        : PaymentStatus.PENDING;
        Payment payment = Payment.builder()
                .order(savedOrder)
                .method(paymentMethod)
                .status(paymentStatus)
                .amount(totalAmount)
                .transactionCode(requestDTO.getTransactionCode() == null || requestDTO.getTransactionCode().isBlank()
                        ? null
                        : requestDTO.getTransactionCode().trim())
                .paidAt(paymentStatus == PaymentStatus.PAID ? LocalDateTime.now() : null)
                .build();
        savedOrder.setPayment(paymentRepository.save(payment));

        Invoice invoice = Invoice.builder().order(savedOrder).build();
        savedOrder.setInvoice(invoiceRepository.save(invoice));

        if (promotion != null) {
            promotion.setUsedCount(promotion.getUsedCount() + 1);
            promotionRepository.save(promotion);
        }

        createNotification(savedOrder, "Đặt hàng thành công",
                "Đơn #" + savedOrder.getId() + " đã được tạo và đang chờ xác nhận.");
        return toResponseDTO(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getAllOrders() {
        return orderRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getMyOrders(String username) {
        return orderRepository.findByUserUsernameOrderByCreatedAtDesc(username)
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponseDTO getOrderById(Long id) {
        return toResponseDTO(findOrderById(id));
    }

    @Override
    @Transactional
    public OrderResponseDTO updateOrderStatus(Long id, OrderStatus status) {
        Order order = findOrderById(id);
        OrderStatus oldStatus = order.getStatus();
        if (oldStatus == status) {
            return toResponseDTO(order);
        }
        if (oldStatus == OrderStatus.CANCELLED || oldStatus == OrderStatus.DELIVERED) {
            throw new BadRequestException("Completed or cancelled orders cannot change status");
        }
        if (status == OrderStatus.CANCELLED) {
            releaseReservedItems(order);
            if (order.getPromotion() != null && order.getPromotion().getUsedCount() > 0) {
                order.getPromotion().setUsedCount(order.getPromotion().getUsedCount() - 1);
            }
        } else if (status == OrderStatus.DELIVERED) {
            completeReservedItems(order);
            if (order.getPayment() != null && order.getPayment().getMethod() == PaymentMethod.COD) {
                order.getPayment().setStatus(PaymentStatus.PAID);
                order.getPayment().setPaidAt(LocalDateTime.now());
            }
        }
        order.setStatus(status);
        Order savedOrder = orderRepository.save(order);
        createNotification(savedOrder, "Cập nhật đơn hàng",
                "Đơn #" + id + " chuyển từ " + oldStatus + " sang " + status + ".");
        return toResponseDTO(savedOrder);
    }

    private Order findOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
    }

    private Product findProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    private OrderResponseDTO toResponseDTO(Order order) {
        return OrderResponseDTO.builder()
                .id(order.getId())
                .customerName(order.getCustomerName())
                .customerPhone(order.getCustomerPhone())
                .customerAddress(order.getCustomerAddress())
                .totalAmount(order.getTotalAmount())
                .subTotal(order.getSubTotal() != null ? order.getSubTotal() : order.getTotalAmount())
                .discountAmount(order.getDiscountAmount() != null ? order.getDiscountAmount() : BigDecimal.ZERO)
                .promotionCode(order.getPromotion() != null ? order.getPromotion().getCode() : null)
                .paymentMethod(order.getPayment() != null ? order.getPayment().getMethod() : null)
                .paymentStatus(order.getPayment() != null ? order.getPayment().getStatus() : null)
                .transactionCode(order.getPayment() != null ? order.getPayment().getTransactionCode() : null)
                .invoiceNumber(order.getInvoice() != null ? order.getInvoice().getInvoiceNumber() : null)
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .items(order.getOrderItems()
                        .stream()
                        .map(this::toOrderItemResponseDTO)
                        .toList())
                .build();
    }

    private Promotion resolvePromotion(String code, BigDecimal subTotal) {
        if (code == null || code.isBlank()) {
            return null;
        }
        Promotion promotion = promotionRepository.findByCodeIgnoreCase(code.trim())
                .orElseThrow(() -> new BadRequestException("Promotion code is invalid"));
        LocalDateTime now = LocalDateTime.now();
        if (!promotion.isActive()
                || now.isBefore(promotion.getStartAt())
                || now.isAfter(promotion.getEndAt())
                || promotion.getUsedCount() >= promotion.getUsageLimit()
                || subTotal.compareTo(promotion.getMinOrderValue()) < 0) {
            throw new BadRequestException("Promotion is expired or order does not meet its conditions");
        }
        return promotion;
    }

    private BigDecimal calculateDiscount(Promotion promotion, BigDecimal subTotal) {
        if (promotion == null) {
            return BigDecimal.ZERO;
        }
        if (promotion.getDiscountType() == DiscountType.PERCENT) {
            return subTotal.multiply(promotion.getDiscountValue())
                    .divide(BigDecimal.valueOf(100));
        }
        return promotion.getDiscountValue().min(subTotal);
    }

    private void ensureLegacyWarehouseItems(Product product) {
        long physicalCount = warehouseItemRepository.findByProductIdAndStatusOrderByIdAsc(
                product.getId(), WarehouseStatus.AVAILABLE).size();
        int missingCount = product.getStockQuantity() - (int) physicalCount;
        for (int index = 0; index < missingCount; index += 1) {
            String identifier = "LEGACY-" + product.getId() + "-" + UUID.randomUUID().toString().substring(0, 8);
            warehouseItemRepository.save(WarehouseItem.builder()
                    .product(product)
                    .barcode(identifier)
                    .serialNumber(identifier)
                    .shelfLocation("Chờ phân khu")
                    .status(WarehouseStatus.AVAILABLE)
                    .build());
        }
    }

    private void reserveWarehouseItems(Order order) {
        for (OrderItem orderItem : order.getOrderItems()) {
            List<WarehouseItem> availableItems = warehouseItemRepository
                    .findByProductIdAndStatusOrderByIdAsc(orderItem.getProduct().getId(), WarehouseStatus.AVAILABLE);
            if (availableItems.size() < orderItem.getQuantity()) {
                throw new BadRequestException("Insufficient physical stock for product: "
                        + orderItem.getProduct().getName());
            }
            availableItems.stream().limit(orderItem.getQuantity()).forEach(item -> {
                item.setStatus(WarehouseStatus.RESERVED);
                item.setReservedOrder(order);
            });
            synchronizeAvailableStock(orderItem.getProduct());
        }
    }

    private void releaseReservedItems(Order order) {
        warehouseItemRepository.findByReservedOrder(order).forEach(item -> {
            item.setStatus(WarehouseStatus.AVAILABLE);
            item.setReservedOrder(null);
            synchronizeAvailableStock(item.getProduct());
        });
    }

    private void completeReservedItems(Order order) {
        List<WarehouseItem> reservedItems = warehouseItemRepository.findByReservedOrder(order);
        for (WarehouseItem item : reservedItems) {
            item.setStatus(WarehouseStatus.SOLD);
            item.setReservedOrder(null);
            OrderItem orderItem = order.getOrderItems().stream()
                    .filter(candidate -> candidate.getProduct().getId().equals(item.getProduct().getId()))
                    .findFirst()
                    .orElse(null);
            LocalDate startDate = LocalDate.now();
            Warranty warranty = Warranty.builder()
                    .serialNumber(item.getSerialNumber())
                    .warehouseItem(item)
                    .orderItem(orderItem)
                    .user(order.getUser())
                    .startDate(startDate)
                    .endDate(startDate.plusMonths(parseWarrantyMonths(item.getProduct().getWarrantyPeriod())))
                    .status(WarrantyStatus.ACTIVE)
                    .build();
            warranty.getHistory().add(WarrantyHistory.builder()
                    .warranty(warranty)
                    .status(WarrantyStatus.ACTIVE)
                    .note("Warranty activated after order delivery")
                    .build());
            warrantyRepository.save(warranty);
            synchronizeAvailableStock(item.getProduct());
        }
    }

    private long parseWarrantyMonths(String warrantyPeriod) {
        if (warrantyPeriod == null) {
            return 12;
        }
        String digits = warrantyPeriod.replaceAll("[^0-9]", "");
        return digits.isBlank() ? 12 : Long.parseLong(digits);
    }

    private void synchronizeAvailableStock(Product product) {
        product.setStockQuantity((int) warehouseItemRepository
                .countByProductIdAndStatus(product.getId(), WarehouseStatus.AVAILABLE));
        productRepository.save(product);
    }

    private void createNotification(Order order, String title, String message) {
        if (order.getUser() != null) {
            notificationRepository.save(Notification.builder()
                    .user(order.getUser())
                    .title(title)
                    .message(message)
                    .read(false)
                    .build());
        }
    }

    private OrderItemResponseDTO toOrderItemResponseDTO(OrderItem orderItem) {
        Product product = orderItem.getProduct();

        return OrderItemResponseDTO.builder()
                .id(orderItem.getId())
                .productId(product != null ? product.getId() : null)
                .productName(product != null ? product.getName() : null)
                .quantity(orderItem.getQuantity())
                .price(orderItem.getPrice())
                .subTotal(orderItem.getSubTotal())
                .build();
    }
}
