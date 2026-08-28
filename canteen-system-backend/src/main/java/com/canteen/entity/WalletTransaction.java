package com.canteen.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "wallet_transactions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WalletTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false)
    private Wallet wallet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false)
    private TransactionType transactionType; // CREDIT, DEBIT, ADJUSTMENT

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "previous_balance", nullable = false, precision = 10, scale = 2)
    private BigDecimal previousBalance;

    @Column(name = "new_balance", nullable = false, precision = 10, scale = 2)
    private BigDecimal newBalance;

    @Column(name = "reference_type")
    private String referenceType; // PURCHASE / MONTHLY_ALLOCATION / MANUAL

    @Column(name = "reference_id")
    private Long referenceId;

    private String description;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "transaction_status")
    @Builder.Default
    private String transactionStatus = "SUCCESS";

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum TransactionType {
        CREDIT, DEBIT, ADJUSTMENT
    }
}
