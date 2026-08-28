package com.canteen.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "purchases")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Purchase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "purchase_number", unique = true, nullable = false)
    private String purchaseNumber;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "previous_balance", nullable = false, precision = 10, scale = 2)
    private BigDecimal previousBalance;

    @Column(name = "new_balance", nullable = false, precision = 10, scale = 2)
    private BigDecimal newBalance;

    @Builder.Default
    private String status = "SUCCESS"; // SUCCESS / FAILED

    @Column(name = "purchased_at")
    private LocalDateTime purchasedAt;

    @OneToMany(mappedBy = "purchase", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PurchaseItem> items = new ArrayList<>();
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        purchasedAt = LocalDateTime.now();
    }
}
