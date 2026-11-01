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
@Document(collection = "fee_records")
public class FeeRecord {
    @Id
    private String id;

    @Indexed
    private String studentId;
    private String studentName;
    private String rollNumber;
    private String roomNumber;

    private String title;
    private String type; // RENT, MESS, FINE, AMENITY, UTILITY
    private double amount;
    private String status; // UNPAID, PAID
    private LocalDate dueDate;
    private LocalDateTime paidAt;
    private String receiptNumber;
    private String remarks;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
