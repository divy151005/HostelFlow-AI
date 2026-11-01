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
@Document(collection = "hostel_complaints")
public class HostelComplaint {
    @Id
    private String id;

    @Indexed
    private String studentId;
    private String studentName;
    private String rollNumber;
    private String roomNumber;
    private String hostelBlock;

    private String category; // FOOD_QUALITY, HYGIENE, INSECTS, INSUFFICIENT_QUANTITY, UNDERCOOKED_FOOD, ELECTRICITY, CLEANLINESS, WATER, MAINTENANCE, OTHER
    private String priority; // LOW, NORMAL, HIGH, URGENT
    private String subject;
    private String description;
    private String status;   // SUBMITTED, ASSIGNED, IN_PROGRESS, RESOLVED, REOPENED

    private String attachmentUrl;
    private String assignedTo;
    private String assignedStaffName;
    private String resolutionNotes;
    private String reopenedReason;
    private LocalDateTime reopenedAt;
    private String verifiedBy;
    private boolean isFoodRelated;

    @Builder.Default
    private List<ComplaintAction> history = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComplaintAction {
        private String actorId;
        private String actorName;
        private String action;
        private String note;
        private LocalDateTime at;
    }
}
