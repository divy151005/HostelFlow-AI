package com.hostelflow.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "hostel_feedback")
@CompoundIndex(name = "student_week_unique", def = "{'studentId': 1, 'weekStart': 1}", unique = true)
public class HostelFeedback {
    @Id
    private String id;
    private String studentId;
    private String studentName;
    private String rollNumber;
    private String roomNumber;
    private String hostelBlock;
    private String weekStart; // YYYY-MM-DD (Monday date of feedback week)

    // Detailed ratings out of 5:
    // electricity, fansLightsSwitches, roomCleanliness, washroomCleanliness, waterSupply, facilities
    private Map<String, Integer> ratings;
    private String comments;
    private String attachmentUrl;
    private LocalDateTime createdAt;
}
