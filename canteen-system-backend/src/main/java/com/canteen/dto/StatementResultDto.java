package com.canteen.dto;

import lombok.*;

@Getter @Setter @Builder
public class StatementResultDto {
    private String studentId;
    private String studentName;
    private String status; // SUCCESS / FAILED
    private String message;
}