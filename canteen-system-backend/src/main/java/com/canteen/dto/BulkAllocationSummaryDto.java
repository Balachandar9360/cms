package com.canteen.dto;

import lombok.*;
import java.util.List;

@Getter @Setter @Builder
public class BulkAllocationSummaryDto {
    private String month;
    private int totalStudents;
    private int successCount;
    private int skippedCount;
    private int failedCount;
    private List<AllocationResultDto> results;
}