package com.canteen.dto;

import lombok.*;

@Getter @Setter @Builder
public class PeakHourDto {
    private Integer hour;      // 0-23
    private Long orderCount;
}