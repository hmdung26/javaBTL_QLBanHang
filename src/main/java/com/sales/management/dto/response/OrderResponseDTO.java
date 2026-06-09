package com.sales.management.dto.response;

import com.sales.management.entity.OrderStatus;
import com.sales.management.entity.PaymentMethod;
import com.sales.management.entity.PaymentStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponseDTO {

    private Long id;

    private String customerName;

    private String customerPhone;

    private String customerAddress;

    private BigDecimal totalAmount;

    private BigDecimal subTotal;

    private BigDecimal discountAmount;

    private String promotionCode;

    private PaymentMethod paymentMethod;

    private PaymentStatus paymentStatus;

    private String transactionCode;

    private String invoiceNumber;

    private OrderStatus status;

    private LocalDateTime createdAt;

    private List<OrderItemResponseDTO> items;
}
