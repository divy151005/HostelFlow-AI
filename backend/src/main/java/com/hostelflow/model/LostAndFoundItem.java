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
@Document(collection = "lost_and_found_items")
public class LostAndFoundItem {
    @Id
    private String id;

    @Indexed
    private String reportedByStudentId;
    private String reporterName;
    private String contactInfo;

    private String title;
    private String type; // LOST, FOUND
    private String category; // ELECTRONICS, KEYS, ID_CARD, CLOTHING, BOOKS, OTHER
    private String location;
    private String description;
    private String imageUrl;

    private String status; // OPEN, CLAIMED

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
