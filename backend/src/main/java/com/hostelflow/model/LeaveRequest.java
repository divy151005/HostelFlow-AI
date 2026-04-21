package com.hostelflow.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "leave_requests")
public class LeaveRequest {

    @Id
    private String id;

    @Indexed
    private String studentId;
    private String studentName;
    private String rollNumber;
    private String roomNumber;

    private LeaveType type;
    private OutingKind outingKind;
    private String reason;
    private String destination;

    private LocalDateTime fromDate;
    private LocalDateTime toDate;
    private LocalDateTime expectedReturn;
    private LocalDateTime actualReturn;

    private Status status;
    private String wardenRemark;
    private String mentorRemark;
    private String parentRemark;

    // Approvals
    private boolean wardenApproved;
    private boolean mentorApproved;
    private boolean parentApproved;
    private String approvedBy;
    private String mentorApprovedBy;
    private boolean parentApprovalRequired;

    // QR
    private String qrCode;
    private String qrToken;
    private boolean qrScannedOut;
    private boolean qrScannedIn;
    private LocalDateTime scannedOutAt;
    private LocalDateTime scannedInAt;

    private boolean isLate;
    private long lateByMinutes;
    private boolean escalated;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public enum LeaveType { LEAVE, OUTING, EMERGENCY }

    public enum OutingKind {
        LOCAL_OUTING,
        WORKING_HOURS,
        RUNNING_COLLEGE,
        MEDICAL_VISIT,
        HOME_VISIT,
        OTHER
    }

    public enum Status {
        PENDING_WARDEN,
        PENDING_MENTOR,
        PENDING_PARENT,
        APPROVED,
        REJECTED,
        CANCELLED,
        COMPLETED,
        LATE
    }
}
