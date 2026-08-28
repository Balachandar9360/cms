package com.canteen.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class CanteenItemRequest {
    @NotBlank
    private String itemName;

    private String description;
    private String category;

    @Positive(message = "Price must be greater than 0")
    private BigDecimal price;

    private boolean available = true;
}
