package com.canteen.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "item_feedback", uniqueConstraints = @UniqueConstraint(columnNames = {"purchase_item_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ItemFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private CanteenItem item;

    // One feedback per purchased line — prevents rating without buying,
    // and prevents rating the same purchase twice.
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_item_id", nullable = false, unique = true)
    private PurchaseItem purchaseItem;

    @Column(nullable = false)
    private Integer rating; // 1-5

    @Column(length = 500)
    private String comment;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}