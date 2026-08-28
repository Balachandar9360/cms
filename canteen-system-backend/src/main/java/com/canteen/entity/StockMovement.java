package com.canteen.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_movements")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StockMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private CanteenItem item;

    @Column(name = "movement_type", nullable = false)
    private String movementType; // RESTOCK / SALE / ADJUSTMENT / WASTAGE

    @Column(nullable = false)
    private Integer quantity; // positive for additions, negative for deductions

    @Column(name = "quantity_before", nullable = false)
    private Integer quantityBefore;

    @Column(name = "quantity_after", nullable = false)
    private Integer quantityAfter;

    private String reason; // optional note, e.g. "Spoiled batch", "Weekly restock"

    @Column(name = "performed_by")
    private String performedBy; // username of admin/staff who made the change

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}