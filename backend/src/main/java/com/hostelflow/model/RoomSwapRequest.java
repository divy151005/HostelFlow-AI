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
@Document(collection = "room_swap_requests")
public class RoomSwapRequest {
    @Id
    private String id;

    @Indexed
    private String applicantStudentId;
    private String applicantName;
    private String applicantRoll;
    private String applicantRoom;
    private String applicantBlock;

    @Indexed
    private String targetStudentId;
    private String targetName;
    private String targetRoll;
    private String targetRoom;
    private String targetBlock;

    private String reason;
    private String status; // PENDING_PEER, PENDING_WARDEN, APPROVED, REJECTED
    private String peerRemark;
    private String wardenRemark;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt;
}
