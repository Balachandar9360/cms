package com.canteen.dto;

import lombok.*;

@Getter @Setter @Builder
public class QrTokenResponse {
    private String token;
    private int expiresInSeconds;
}