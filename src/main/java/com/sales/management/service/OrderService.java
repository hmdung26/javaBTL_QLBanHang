package com.sales.management.service;

import com.sales.management.dto.request.OrderRequestDTO;
import com.sales.management.entity.OrderStatus;
import com.sales.management.dto.response.OrderResponseDTO;
import java.util.List;

public interface OrderService {

    OrderResponseDTO createOrder(OrderRequestDTO requestDTO);

    OrderResponseDTO createOrder(OrderRequestDTO requestDTO, String username);

    List<OrderResponseDTO> getAllOrders();

    List<OrderResponseDTO> getMyOrders(String username);

    OrderResponseDTO getOrderById(Long id);

    OrderResponseDTO updateOrderStatus(Long id, OrderStatus status);
}
