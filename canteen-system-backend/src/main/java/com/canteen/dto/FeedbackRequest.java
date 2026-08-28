package com.canteen.dto;

import lombok.*;

@Getter @Setter
public class FeedbackRequest {
    private Long purchaseItemId;
    private Integer rating;
    private String comment;
}