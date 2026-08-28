package com.canteen.service;

import com.canteen.dto.WalletResponse;
import com.canteen.dto.WalletTransactionResponse;
import com.canteen.entity.*;
import com.canteen.exception.ResourceNotFoundException;
import com.canteen.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;

@Service
@RequiredArgsConstructor
public class WalletService {

    public static final BigDecimal MONTHLY_TARGET = new BigDecimal("7000.00");

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final MonthlyWalletAllocationRepository allocationRepository;
    private final StudentRepository studentRepository;

    public Wallet createWalletForStudent(Student student) {
        Wallet wallet = Wallet.builder()
                .student(student)
                .currentBalance(BigDecimal.ZERO)
                .build();
        return walletRepository.save(wallet);
    }

    public Wallet getWalletByStudentId(String studentId) {
        return walletRepository.findByStudent_StudentId(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for student " + studentId));
    }

    public WalletResponse getWalletSummary(String studentId) {
        Wallet wallet = getWalletByStudentId(studentId);
        YearMonth thisMonth = YearMonth.now();

        BigDecimal monthCredit = allocationRepository
                .findByStudent_StudentIdAndAllocationMonth(studentId, thisMonth)
                .map(MonthlyWalletAllocation::getCreditAmount)
                .orElse(BigDecimal.ZERO);

        BigDecimal monthSpending = walletTransactionRepository
                .findByStudent_StudentIdOrderByCreatedAtDesc(studentId, Pageable.unpaged())
                .stream()
                .filter(t -> t.getTransactionType() == WalletTransaction.TransactionType.DEBIT)
                .filter(t -> YearMonth.from(t.getCreatedAt()).equals(thisMonth))
                .map(WalletTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return WalletResponse.builder()
                .currentBalance(wallet.getCurrentBalance())
                .monthlyTarget(MONTHLY_TARGET)
                .currentMonthCredit(monthCredit)
                .currentMonthSpending(monthSpending)
                .build();
    }

    /**
     * Idempotent monthly allocation for a single student.
     * creditAmount = target - currentBalance (only if currentBalance < target)
     * Protected by the unique constraint on (student_id, allocation_month).
     */
    @Transactional
    public void processMonthlyAllocation(String studentId, YearMonth allocationMonth) {
        if (allocationRepository.existsByStudent_StudentIdAndAllocationMonth(studentId, allocationMonth)) {
            return; // already processed - idempotent guard
        }

        Wallet wallet = walletRepository.findByStudentIdForUpdate(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for student " + studentId));

        BigDecimal previousBalance = wallet.getCurrentBalance();
        BigDecimal creditAmount = previousBalance.compareTo(MONTHLY_TARGET) < 0
                ? MONTHLY_TARGET.subtract(previousBalance)
                : BigDecimal.ZERO;

        BigDecimal newBalance = previousBalance.add(creditAmount);
        wallet.setCurrentBalance(newBalance);
        walletRepository.save(wallet);

        if (creditAmount.compareTo(BigDecimal.ZERO) > 0) {
            walletTransactionRepository.save(WalletTransaction.builder()
                    .wallet(wallet)
                    .student(wallet.getStudent())
                    .transactionType(WalletTransaction.TransactionType.CREDIT)
                    .amount(creditAmount)
                    .previousBalance(previousBalance)
                    .newBalance(newBalance)
                    .referenceType("MONTHLY_ALLOCATION")
                    .description("Monthly canteen wallet allocation for " + allocationMonth)
                    .createdBy("SYSTEM")
                    .build());
        }

        allocationRepository.save(MonthlyWalletAllocation.builder()
                .student(wallet.getStudent())
                .allocationMonth(allocationMonth)
                .previousBalance(previousBalance)
                .targetBalance(MONTHLY_TARGET)
                .creditAmount(creditAmount)
                .finalBalance(newBalance)
                .status("SUCCESS")
                .build());
    }

    @Transactional
    public WalletTransaction manualAdjustment(String studentId, BigDecimal amount, String description, String adminUsername) {
        Wallet wallet = walletRepository.findByStudentIdForUpdate(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for student " + studentId));

        BigDecimal previousBalance = wallet.getCurrentBalance();
        BigDecimal newBalance = previousBalance.add(amount);
        if (newBalance.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Adjustment would make balance negative");
        }

        wallet.setCurrentBalance(newBalance);
        walletRepository.save(wallet);

        return walletTransactionRepository.save(WalletTransaction.builder()
                .wallet(wallet)
                .student(wallet.getStudent())
                .transactionType(WalletTransaction.TransactionType.ADJUSTMENT)
                .amount(amount.abs())
                .previousBalance(previousBalance)
                .newBalance(newBalance)
                .referenceType("MANUAL")
                .description(description)
                .createdBy(adminUsername)
                .build());
    }
    
    
    @Transactional
    public void processInitialAllocation(Student student) {
        String studentId = student.getStudentId();
        YearMonth currentMonth = YearMonth.now();

        if (allocationRepository.existsByStudent_StudentIdAndAllocationMonth(studentId, currentMonth)) {
            return; // idempotent guard
        }

        Wallet wallet = walletRepository.findByStudentIdForUpdate(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for student " + studentId));

        LocalDate today = LocalDate.now();
        int daysInMonth = currentMonth.lengthOfMonth();               // 28, 29, 30, or 31 — actual
        int remainingDays = daysInMonth - today.getDayOfMonth() + 1;  // inclusive of today

        BigDecimal dailyRate = MONTHLY_TARGET.divide(
                BigDecimal.valueOf(daysInMonth), 4, RoundingMode.HALF_UP); // extra precision before final round

        BigDecimal proratedAmount = dailyRate.multiply(BigDecimal.valueOf(remainingDays))
                .setScale(2, RoundingMode.HALF_UP);

        // Registering on day 1 should always net exactly the full target, regardless of rounding drift
        if (remainingDays == daysInMonth) {
            proratedAmount = MONTHLY_TARGET;
        }

        BigDecimal previousBalance = wallet.getCurrentBalance();
        BigDecimal newBalance = previousBalance.add(proratedAmount);
        wallet.setCurrentBalance(newBalance);
        walletRepository.save(wallet);

        if (proratedAmount.compareTo(BigDecimal.ZERO) > 0) {
            walletTransactionRepository.save(WalletTransaction.builder()
                    .wallet(wallet)
                    .student(student)
                    .transactionType(WalletTransaction.TransactionType.CREDIT)
                    .amount(proratedAmount)
                    .previousBalance(previousBalance)
                    .newBalance(newBalance)
                    .referenceType("INITIAL_ALLOCATION")
                    .description(String.format(
                            "Prorated initial allocation: %d of %d day(s) remaining in %s at %.2f/day",
                            remainingDays, daysInMonth, currentMonth, dailyRate))
                    .createdBy("SYSTEM")
                    .build());
        }

        allocationRepository.save(MonthlyWalletAllocation.builder()
                .student(student)
                .allocationMonth(currentMonth)
                .previousBalance(previousBalance)
                .targetBalance(MONTHLY_TARGET)
                .creditAmount(proratedAmount)
                .finalBalance(newBalance)
                .status("SUCCESS")
                .build());
    }
    
    public Page<WalletTransactionResponse> getTransactions(String studentId, Pageable pageable) {
        return walletTransactionRepository.findByStudent_StudentIdOrderByCreatedAtDesc(studentId, pageable)
                .map(this::toResponse);
    }

    private WalletTransactionResponse toResponse(WalletTransaction t) {
        return WalletTransactionResponse.builder()
                .id(t.getId())
                .transactionType(t.getTransactionType().name())
                .amount(t.getAmount())
                .previousBalance(t.getPreviousBalance())
                .newBalance(t.getNewBalance())
                .referenceType(t.getReferenceType())
                .referenceId(t.getReferenceId())
                .description(t.getDescription())
                .createdBy(t.getCreatedBy())
                .createdAt(t.getCreatedAt())
                .build();
    }
}
