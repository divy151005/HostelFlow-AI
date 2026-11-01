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
@Document(collection = "mess_timetables")
public class MessTimetable {

    @Id
    private String id;

    @Indexed(unique = true)
    private String dayOfWeek; // MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY

    // Meal items & timings
    private MealInfo breakfast;
    private MealInfo lunch;
    private MealInfo snacks;
    private MealInfo dinner;

    private String specialNotes;
    private String updatedBy;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MealInfo {
        private String items;
        private String timing; // e.g. "07:30 - 09:30"
        private String category; // Veg, Non-Veg, Special
    }
}
