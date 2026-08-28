package com.canteen.repository;

import com.canteen.entity.MonthlyWalletAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.YearMonth;
import java.util.Optional;

public interface MonthlyWalletAllocationRepository extends JpaRepository<MonthlyWalletAllocation, Long> {
    Optional<MonthlyWalletAllocation> findByStudent_StudentIdAndAllocationMonth(String studentId, YearMonth allocationMonth);
    boolean existsByStudent_StudentIdAndAllocationMonth(String studentId, YearMonth allocationMonth);
}
