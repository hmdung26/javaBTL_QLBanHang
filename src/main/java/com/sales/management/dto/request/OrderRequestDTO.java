package com.sales.management.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;
import com.sales.management.entity.PaymentMethod;
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
public class OrderRequestDTO {

    @NotBlank(message = "Customer name is required")
    @Size(max = 255, message = "Customer name must not exceed 255 characters")
    private String customerName;

    @NotBlank(message = "Customer phone is required")
    @Pattern(regexp = "^[0-9+\\-\\s]{8,20}$", message = "Customer phone is invalid")
    private String customerPhone;

    @NotBlank(message = "Customer address is required")
    @Size(max = 1000, message = "Customer address must not exceed 1000 characters")
    private String customerAddress;

    private String promotionCode;

    private PaymentMethod paymentMethod;

    @Size(max = 255, message = "Transaction code must not exceed 255 characters")
    private String transactionCode;

    @Valid
    @NotEmpty(message = "Order must contain at least one item")
    private List<OrderItemRequestDTO> items;
}
