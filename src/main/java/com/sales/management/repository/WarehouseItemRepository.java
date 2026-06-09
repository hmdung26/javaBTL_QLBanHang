package com.sales.management.repository;

import com.sales.management.entity.Order;
import com.sales.management.entity.WarehouseItem;
import com.sales.management.entity.WarehouseStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WarehouseItemRepository extends JpaRepository<WarehouseItem, Long> {

    long countByProductIdAndStatus(Long productId, WarehouseStatus status);

    List<WarehouseItem> findByProductIdAndStatusOrderByIdAsc(Long productId, WarehouseStatus status);

    List<WarehouseItem> findByReservedOrder(Order order);

    Optional<WarehouseItem> findBySerialNumberIgnoreCase(String serialNumber);
}
