package com.canteen.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @Builder
public class AllocationResultDto {
    private String studentId;
    private String studentName;
    private String status;       // SUCCESS / SKIPPED / FAILED
    private BigDecimal creditAmount;
    private String message;
}