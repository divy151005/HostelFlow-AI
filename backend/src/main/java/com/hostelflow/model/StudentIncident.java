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
@Document(collection = "student_incidents")
public class StudentIncident {

    @Id
    private String id;

    @Indexed
    private String studentId;
    private String studentName;
    private String rollNumber;
    private String roomNumber;
    private String hostelBlock;

    private String reportedById;
    private String reportedByName;

    private IncidentType type; // REPEATED_LATE_RETURN, UNAUTHORISED_ABSENCE, MISCONDUCT, PROPERTY_DAMAGE, RULE_VIOLATION, OTHER
    private Severity severity; // LOW, MEDIUM, HIGH, CRITICAL

    private String title;
    private String description;

    private Status status; // REPORTED, EXPLANATION_SUBMITTED, UNDER_REVIEW, ACTION_TAKEN, CLOSED

    private String studentExplanation;
    private LocalDateTime studentExplanationAt;

    private String wardenAction;
    private LocalDateTime wardenActionAt;
    private String resolvedBy;

    private boolean parentNotified;
    private boolean mentorNotified;

    @Builder.Default
    private List<IncidentAction> history = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public enum IncidentType {
        REPEATED_LATE_RETURN,
        UNAUTHORISED_ABSENCE,
        MISCONDUCT,
        PROPERTY_DAMAGE,
        RULE_VIOLATION,
        OTHER
    }

    public enum Severity {
        LOW, MEDIUM, HIGH, CRITICAL
    }

    public enum Status {
        REPORTED,
        EXPLANATION_SUBMITTED,
        UNDER_REVIEW,
        ACTION_TAKEN,
        CLOSED
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class IncidentAction {
        private String actorId;
        private String actorName;
        private String action;
        private String note;
        private LocalDateTime at;
    }
}
