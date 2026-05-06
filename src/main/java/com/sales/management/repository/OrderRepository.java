package com.sales.management.repository;

import com.sales.management.entity.Order;
import com.sales.management.entity.OrderStatus;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface OrderRepository extends JpaRepository<Order, Long> {

    long countByStatus(OrderStatus status);

    List<Order> findByUserUsernameOrderByCreatedAtDesc(String username);

    @Query("""
            select coalesce(sum(o.totalAmount), 0)
            from SalesOrder o
            where o.status in (com.sales.management.entity.OrderStatus.PROCESSING,
                               com.sales.management.entity.OrderStatus.SHIPPED,
                               com.sales.management.entity.OrderStatus.DELIVERED)
            """)
    Optional<BigDecimal> sumRevenueByCompletedStatuses();

    @Query("""
            select year(o.createdAt), month(o.createdAt), coalesce(sum(o.totalAmount), 0), count(o)
            from SalesOrder o
            where o.status in (com.sales.management.entity.OrderStatus.PROCESSING,
                               com.sales.management.entity.OrderStatus.SHIPPED,
                               com.sales.management.entity.OrderStatus.DELIVERED)
            group by year(o.createdAt), month(o.createdAt)
            order by year(o.createdAt), month(o.createdAt)
            """)
    List<Object[]> findMonthlyRevenue();
}
