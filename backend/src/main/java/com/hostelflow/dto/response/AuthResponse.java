package com.hostelflow.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private long expiresIn;
    private UserInfo user;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private String id;
        private String email;
        private String fullName;
        private String role;
        private String rollNumber;
        private String roomNumber;
        private String hostelBlock;
        private String riskLevel;
        private Integer lateReturnCount;
    }
}
