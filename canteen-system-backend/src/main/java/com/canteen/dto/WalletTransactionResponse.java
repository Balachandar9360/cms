package com.canteen.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WalletTransactionResponse {
    private Long id;
    private String transactionType;
    private BigDecimal amount;
    private BigDecimal previousBalance;
    private BigDecimal newBalance;
    private String referenceType;
    private Long referenceId;
    private String description;
    private String createdBy;
    private LocalDateTime createdAt;
}