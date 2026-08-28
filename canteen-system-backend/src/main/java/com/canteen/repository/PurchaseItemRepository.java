package com.canteen.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.canteen.entity.PurchaseItem;

public interface PurchaseItemRepository extends JpaRepository<PurchaseItem, Long> {
	
	@Query("SELECT pi FROM PurchaseItem pi " +
	           "WHERE pi.purchase.student.studentId = :studentId " +
	           "AND pi.purchase.status = 'SUCCESS' " +
	           "AND pi.id NOT IN (SELECT f.purchaseItem.id FROM ItemFeedback f) " +
	           "ORDER BY pi.purchase.purchasedAt DESC")
	    List<PurchaseItem> findUnratedByStudent(@Param("studentId") String studentId);
	
}
