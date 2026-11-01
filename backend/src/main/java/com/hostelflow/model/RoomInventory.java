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
@Document(collection = "room_inventories")
public class RoomInventory {
    @Id
    private String id;

    @Indexed
    private String studentId;
    private String studentName;
    private String roomNumber;
    private String hostelBlock;

    private boolean keyHandedOver;
    private String tableCondition; // EXCELLENT, GOOD, DAMAGED
    private String chairCondition; // EXCELLENT, GOOD, DAMAGED
    private String fanCondition;   // WORKING, FAULTY
    private String mattressCondition; // CLEAN, STAINED, DAMAGED
    private String wallPaintCondition; // FRESH, NEEDS_PAINT
    private String remarks;

    private boolean verifiedByWarden;
    private String verifiedBy;

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}
