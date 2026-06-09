package com.sales.management.repository;

import com.sales.management.entity.Warranty;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WarrantyRepository extends JpaRepository<Warranty, Long> {

    Optional<Warranty> findBySerialNumberIgnoreCase(String serialNumber);

    List<Warranty> findByUserUsernameOrderByCreatedAtDesc(String username);
}
