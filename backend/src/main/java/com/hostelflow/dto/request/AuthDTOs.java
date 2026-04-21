package com.hostelflow.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

public class AuthDTOs {

    @Data
    public static class LoginRequest {
        @NotBlank @Email
        private String email;
        @NotBlank @Size(min = 6)
        private String password;
    }

    @Data
    public static class RegisterRequest {
        @NotBlank
        private String fullName;
        @NotBlank @Email
        private String email;
        @NotBlank @Size(min = 6)
        private String password;
        @NotBlank
        private String phone;
        @NotBlank
        private String role; // STUDENT, WARDEN, MENTOR, PARENT

        // Student fields
        private String rollNumber;
        private String roomNumber;
        private String hostelBlock;
        private String course;
        private String year;
        private String parentEmail;
        private String mentorEmail;

        // Staff fields
        private String assignedBlock;

        // Parent fields
        private String linkedStudentId;
    }

    @Data
    public static class RefreshTokenRequest {
        @NotBlank
        private String refreshToken;
    }
}
