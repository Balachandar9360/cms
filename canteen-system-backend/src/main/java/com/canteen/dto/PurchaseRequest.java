package com.canteen.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import java.util.List;

@Data
public class PurchaseRequest {

    @NotEmpty(message = "Purchase must contain at least one item")
    @Valid
    private List<PurchaseLineItem> items;

    @Data
    public static class PurchaseLineItem {
        private Long itemId;
        private Integer quantity;
    }
}
