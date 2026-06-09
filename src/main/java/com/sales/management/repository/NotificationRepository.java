package com.sales.management.repository;

import com.sales.management.entity.Notification;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserUsernameOrderByCreatedAtDesc(String username);
}
