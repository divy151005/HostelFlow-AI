package com.hostelflow.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String password;
    private String fullName;
    private String phone;
    private Role role;

    // Student-specific
    private String rollNumber;
    private String roomNumber;
    private String hostelBlock;
    private String course;
    private String year;
    private String parentEmail;
    private String parentPhone;
    private String mentorEmail;
    private Integer lateReturnCount;
    private RiskLevel riskLevel;

    // Staff-specific
    private String wardenId;
    private String assignedBlock;

    // Parent-specific
    private String linkedStudentId;

    private boolean enabled;
    private boolean accountNonLocked;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String fcmToken;

    public enum Role { STUDENT, WARDEN, MENTOR, PARENT, ADMIN }
    public enum RiskLevel { LOW, MEDIUM, HIGH }
}
