package com.canteen.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @Builder
public class WalletResponse {
    private BigDecimal currentBalance;
    private BigDecimal monthlyTarget;
    private BigDecimal currentMonthCredit;
    private BigDecimal currentMonthSpending;
}
