package com.canteen.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;

@Entity
@Table(name = "monthly_wallet_allocations",
        uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "allocation_month"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MonthlyWalletAllocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "allocation_month", nullable = false)
    private YearMonth allocationMonth;

    @Column(name = "previous_balance", nullable = false, precision = 10, scale = 2)
    private BigDecimal previousBalance;

    @Column(name = "target_balance", nullable = false, precision = 10, scale = 2)
    private BigDecimal targetBalance;

    @Column(name = "credit_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal creditAmount;

    @Column(name = "final_balance", nullable = false, precision = 10, scale = 2)
    private BigDecimal finalBalance;

    @Builder.Default
    private String status = "SUCCESS"; // SUCCESS / FAILED

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @PrePersist
    protected void onCreate() {
        processedAt = LocalDateTime.now();
    }
}
