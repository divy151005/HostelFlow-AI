package com.hostelflow.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "no_dues_requests")
public class NoDuesRequest {
    @Id
    private String id;

    @Indexed
    private String studentId;
    private String studentName;
    private String rollNumber;
    private String roomNumber;
    private String hostelBlock;

    private String reason; // VACATING, GRADUATION, SEMESTER_BREAK, TRANSFER
    
    private boolean wardenCleared;
    private String wardenRemarks;

    private boolean messCleared;
    private String messRemarks;

    private boolean maintenanceCleared;
    private String maintenanceRemarks;

    private boolean accountsCleared;
    private String accountsRemarks;

    private String status; // PENDING, APPROVED, REJECTED
    private String certificateId;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime completedAt;
}
