package com.canteen.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @Builder
public class QrStudentPreviewResponse {
    private String studentId;
    private String studentName;
    private BigDecimal currentBalance;
}