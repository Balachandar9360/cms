package com.canteen.dto;

import com.canteen.entity.CanteenItem;
import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @Builder
public class CanteenItemDto {
    private Long id;
    private String itemCode;
    private String itemName;
    private String category;
    private BigDecimal price;
    private Integer stockQuantity;
    private Integer lowStockThreshold;
    private String unit;
    private boolean available;
    private boolean activeStatus;

    public static CanteenItemDto from(CanteenItem item) {
        return CanteenItemDto.builder()
                .id(item.getId())
                .itemCode(item.getItemCode())
                .itemName(item.getItemName())
                .category(item.getCategory())
                .price(item.getPrice())
                .stockQuantity(item.getStockQuantity())
                .lowStockThreshold(item.getLowStockThreshold())
                .unit(item.getUnit())
                .available(item.isAvailable())
                .activeStatus(item.isActiveStatus())
                .build();
    }
}