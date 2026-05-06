package com.sales.management.repository;

import com.sales.management.entity.ProductReview;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {

    List<ProductReview> findByProductIdOrderByCreatedAtDesc(Long productId);

    List<ProductReview> findByUserUsernameOrderByCreatedAtDesc(String username);

    long countByProductId(Long productId);

    @Query("select coalesce(avg(r.rating), 0) from ProductReview r where r.product.id = :productId")
    double averageRatingByProductId(@Param("productId") Long productId);
}
