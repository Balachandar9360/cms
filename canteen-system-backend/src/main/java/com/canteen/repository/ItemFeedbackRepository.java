package com.canteen.repository;

import com.canteen.entity.ItemFeedback;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ItemFeedbackRepository extends JpaRepository<ItemFeedback, Long> {

    boolean existsByPurchaseItem_Id(Long purchaseItemId);

    Page<ItemFeedback> findByItem_IdOrderByCreatedAtDesc(Long itemId, Pageable pageable);

    Page<ItemFeedback> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT f.item.id AS itemId, f.item.itemName AS itemName, " +
           "AVG(f.rating) AS avgRating, COUNT(f) AS ratingCount " +
           "FROM ItemFeedback f GROUP BY f.item.id, f.item.itemName " +
           "ORDER BY avgRating DESC")
    List<Object[]> getRatingSummaryRaw();
}