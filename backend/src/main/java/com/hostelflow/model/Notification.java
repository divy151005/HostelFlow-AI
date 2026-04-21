package com.hostelflow.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    private String userId;
    private String title;
    private String message;
    private NotificationType type;
    private String referenceId;
    private boolean read;
    private LocalDateTime createdAt;

    public enum NotificationType {
        LEAVE_SUBMITTED,
        LEAVE_APPROVED,
        LEAVE_REJECTED,
        LATE_RETURN,
        HIGH_RISK_ALERT,
        QR_SCANNED,
        ESCALATION,
        PARENT_APPROVAL_NEEDED,
        MENTOR_APPROVAL_NEEDED
    }
}
