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
@Document(collection = "food_feedback")
public class FoodFeedback {

    @Id
    private String id;

    @Indexed
    private String studentId;
    private String studentName;
    private String rollNumber;
    private String roomNumber;

    private String mealType; // BREAKFAST, LUNCH, SNACKS, DINNER
    private String date; // YYYY-MM-DD

    private int foodQualityRating; // 1-5
    private int hygieneRating;     // 1-5
    private String comments;
    private String attachmentUrl;

    private LocalDateTime createdAt;
}
