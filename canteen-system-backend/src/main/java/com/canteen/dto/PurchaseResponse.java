package com.canteen.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class PurchaseResponse {
    private Long id;
    private String purchaseNumber;
    private BigDecimal totalAmount;
    private BigDecimal previousBalance;
    private BigDecimal newBalance;
    private String status;
    private LocalDateTime createdAt;
    private List<PurchaseItemResponse> items;

    @Data
    @Builder
    public static class PurchaseItemResponse {
        private Long itemId;
        private String itemName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
    }
}