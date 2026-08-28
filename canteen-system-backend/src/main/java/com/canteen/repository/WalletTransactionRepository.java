package com.canteen.repository;

import com.canteen.entity.WalletTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {
    Page<WalletTransaction> findByStudent_StudentIdOrderByCreatedAtDesc(String studentId, Pageable pageable);
}
