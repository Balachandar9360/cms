package com.canteen.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @Builder
public class UnratedPurchaseResponse {
    private Long purchaseItemId;
    private String itemName;
    private Integer quantity;
    private LocalDateTime purchasedAt;
}