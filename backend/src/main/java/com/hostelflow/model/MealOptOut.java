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
@Document(collection = "meal_opt_outs")
public class MealOptOut {
    @Id
    private String id;

    @Indexed
    private String studentId;
    private String studentName;
    private String rollNumber;
    private String roomNumber;

    @Indexed
    private LocalDate optOutDate;
    private String mealType; // BREAKFAST, LUNCH, SNACKS, DINNER
    private String reason;
    private double rebateAmount; // e.g. 50.0

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
