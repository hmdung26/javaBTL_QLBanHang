package com.sales.management.repository;

import com.sales.management.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {

    long countByStockQuantityLessThanEqual(int stockQuantity);
}
