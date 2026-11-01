package com.hostelflow.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "visitor_passes")
public class VisitorPass {
    @Id
    private String id;

    @Indexed
    private String studentId;
    private String studentName;
    private String studentRoll;
    private String studentRoom;

    private String visitorName;
    private String visitorPhone;
    private String relationship;
    private String purpose;

    private LocalDate visitDate;
    private String timeSlot;
    
    @Indexed
    private String passCode;
    private String qrToken;

    private String status; // PENDING, APPROVED, REJECTED, CHECKED_IN, COMPLETED
    private String wardenRemarks;

    private LocalDateTime checkedInAt;
    private LocalDateTime checkedOutAt;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
