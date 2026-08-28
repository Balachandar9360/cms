package com.canteen.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @Builder
public class SalesSummaryDto {
    private BigDecimal todayRevenue;
    private BigDecimal weekRevenue;
    private BigDecimal monthRevenue;
    private BigDecimal avgOrderValue;
    private Long totalOrdersMonth;
}