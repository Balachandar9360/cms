package com.canteen.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @Builder
public class TopItemDto {
    private String itemName;
    private String itemCode;
    private Long quantitySold;
    private BigDecimal revenue;
}