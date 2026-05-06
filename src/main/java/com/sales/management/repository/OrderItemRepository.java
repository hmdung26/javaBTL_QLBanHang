package com.sales.management.repository;

import com.sales.management.entity.OrderItem;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    @Query("select coalesce(sum(i.quantity), 0) from OrderItem i where i.product.id = :productId")
    long sumQuantityByProductId(@Param("productId") Long productId);
}
