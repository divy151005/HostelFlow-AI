package com.hostelflow.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "meal_polls")
public class MealPoll {
    @Id
    private String id;
    private String title;
    private String mealType;
    private String date;
    
    @Builder.Default
    private List<String> options = new ArrayList<>();

    @Builder.Default
    private Map<String, Integer> voteCounts = new HashMap<>();

    @Builder.Default
    private List<String> votedStudentIds = new ArrayList<>();

    @Builder.Default
    private boolean active = true;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
