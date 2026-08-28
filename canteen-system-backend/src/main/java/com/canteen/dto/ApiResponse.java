package com.canteen.dto;

import lombok.*;

// Consistent API response wrapper for every endpoint
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ApiResponse<T> {
    private boolean success;
    private int status;
    private String message;
    private T data;
    private String error;

    public static <T> ApiResponse<T> success(int status, String message, T data) {
        return ApiResponse.<T>builder().success(true).status(status).message(message).data(data).build();
    }

    public static <T> ApiResponse<T> error(int status, String message, String errorCode) {
        return ApiResponse.<T>builder().success(false).status(status).message(message).error(errorCode).build();
    }
}
