package com.canteen.repository;

import com.canteen.entity.CanteenItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CanteenItemRepository extends JpaRepository<CanteenItem, Long> {
    List<CanteenItem> findByActiveStatusTrueAndAvailableTrue();
    Optional<CanteenItem> findByItemCode(String itemCode);
    
    @Query("SELECT c FROM CanteenItem c WHERE c.stockQuantity <= c.lowStockThreshold AND c.activeStatus = true")
    List<CanteenItem> findLowStockItems();

    @Query("SELECT c FROM CanteenItem c WHERE c.stockQuantity = 0 AND c.activeStatus = true")
    List<CanteenItem> findOutOfStockItems();
    
    
}
