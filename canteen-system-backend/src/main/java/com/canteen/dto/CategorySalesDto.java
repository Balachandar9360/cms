package com.canteen.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @Builder
public class CategorySalesDto {
    private String category;
    private BigDecimal revenue;
    private Long quantitySold;
}