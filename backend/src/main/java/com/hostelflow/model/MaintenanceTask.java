package com.hostelflow.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "maintenance_tasks")
public class MaintenanceTask {

    @Id
    private String id;

    private String title;
    private String description;
    private String category; // ELECTRICAL, PLUMBING, CARPENTRY, CLEANING, APPLIANCE, CIVIL, OTHER
    private String priority; // LOW, NORMAL, HIGH, URGENT

    @Indexed
    private String roomNumber;
    private String hostelBlock;

    private String status; // PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED

    private String assignedStaffName;
    private String assignedStaffPhone;

    private String reportedBy;      // Name of reporter (Warden, Student, System)
    private String studentId;       // Optional linked student
    private String complaintId;     // Optional linked complaint ID
    private String feedbackRefId;   // Optional linked weekly feedback ID

    private String resolutionNotes;
    private LocalDateTime completedAt;

    @Builder.Default
    private List<TaskAction> history = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TaskAction {
        private String actorId;
        private String actorName;
        private String action;
        private String note;
        private LocalDateTime at;
    }
}
