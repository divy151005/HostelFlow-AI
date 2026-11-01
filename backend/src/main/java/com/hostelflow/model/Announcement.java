package com.hostelflow.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "announcements")
public class Announcement {

    @Id
    private String id;

    private String title;
    private String content;
    private String authorName;
    private String authorRole;
    private String priority; // NORMAL, IMPORTANT, URGENT
    private List<String> targetRoles; // STUDENT, MENTOR, WARDEN, PARENT, ALL

    private LocalDateTime createdAt;
}
