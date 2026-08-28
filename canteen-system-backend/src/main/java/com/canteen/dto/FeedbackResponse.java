package com.canteen.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @Builder
public class FeedbackResponse {
    private Long id;
    private String studentName;
    private String itemName;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}