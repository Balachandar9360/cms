package com.canteen.repository;

import com.canteen.entity.Purchase;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PurchaseRepository extends JpaRepository<Purchase, Long> {
    Page<Purchase> findByStudent_StudentIdOrderByPurchasedAtDesc(String studentId, Pageable pageable);
}
