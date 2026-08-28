package com.canteen.dto;

import lombok.*;

@Getter @Setter @Builder
public class LoginResponse {
    private String token;
    private UserInfo user;

    @Getter @Setter @Builder
    public static class UserInfo {
        private Long userId;
        private String studentId; // null for admin
        private String name;
        private String role;
    }
}
