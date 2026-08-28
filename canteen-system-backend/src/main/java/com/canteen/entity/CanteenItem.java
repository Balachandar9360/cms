package com.canteen.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "canteen_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CanteenItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "item_code", unique = true, nullable = false)
    private String itemCode;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    private String description;
    private String category;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Builder.Default
    private boolean available = true;

    @Column(name = "active_status")
    @Builder.Default
    private boolean activeStatus = true;

    // --- New stock tracking fields ---
    @Column(name = "stock_quantity", nullable = false)
    @Builder.Default
    private Integer stockQuantity = 0;

    @Column(name = "low_stock_threshold", nullable = false)
    @Builder.Default
    private Integer lowStockThreshold = 10;

    @Column(name = "unit")
    @Builder.Default
    private String unit = "pcs"; // pcs, kg, litre, etc.

    @Version
    private Long version; // optimistic locking to prevent race conditions on concurrent sales

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}