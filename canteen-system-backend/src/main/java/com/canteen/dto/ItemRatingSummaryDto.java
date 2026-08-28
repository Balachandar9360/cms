package com.canteen.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @Builder
public class ItemRatingSummaryDto {
    private Long itemId;
    private String itemName;
    private BigDecimal avgRating;
    private Long ratingCount;
}