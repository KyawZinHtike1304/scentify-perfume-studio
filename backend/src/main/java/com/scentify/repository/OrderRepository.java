package com.scentify.repository;

import com.scentify.domain.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, Long> {
  List<Order> findByUserIdOrderByCreatedAtDesc(UUID userId);

  List<Order> findAllByOrderByCreatedAtDesc();
}
