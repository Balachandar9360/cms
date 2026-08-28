package com.canteen.repository;

import com.canteen.entity.Wallet;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface WalletRepository extends JpaRepository<Wallet, Long> {

    Optional<Wallet> findByStudent_StudentId(String studentId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select w from Wallet w where w.student.studentId = :studentId")
    Optional<Wallet> findByStudentIdForUpdate(@Param("studentId") String studentId);
    
    @Query("SELECT w FROM Wallet w WHERE w.currentBalance < :threshold")
    List<Wallet> findLowBalanceWallets(@Param("threshold") BigDecimal threshold);
    
    @Query("SELECT w FROM Wallet w JOIN FETCH w.student WHERE w.currentBalance < :threshold ORDER BY w.currentBalance ASC")
    List<Wallet> findLowBalanceWalletsWithStudent(@Param("threshold") BigDecimal threshold);
}
