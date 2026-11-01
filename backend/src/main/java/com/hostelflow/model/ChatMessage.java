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
@Document(collection = "chat_messages")
public class ChatMessage {

    @Id
    private String id;

    @Indexed
    private String conversationId; // e.g. "studentId_mentorId" or "wardenId_parentId"

    private String senderId;
    private String senderName;
    private String senderRole; // STUDENT, MENTOR, WARDEN, PARENT, ADMIN

    private String recipientId;
    private String recipientName;
    private String recipientRole;

    private String content;
    private boolean isRead;
    private LocalDateTime readAt;

    @Indexed
    private LocalDateTime createdAt;
}
