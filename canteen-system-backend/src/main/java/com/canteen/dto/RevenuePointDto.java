package com.canteen.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @Builder
public class RevenuePointDto {
    private String label;      // e.g. "2026-08-15" or "2026-08"
    private BigDecimal revenue;
    private Long orderCount;
}