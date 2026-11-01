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
@Document(collection = "laundry_bookings")
public class LaundryBooking {
    @Id
    private String id;

    @Indexed
    private String studentId;
    private String studentName;
    private String roomNumber;

    private String machineNumber; // Machine 1, Machine 2, Machine 3, Machine 4
    private LocalDate bookingDate;
    private String timeSlot; // e.g. "08:00 AM - 09:00 AM"

    private String status; // BOOKED, COMPLETED, CANCELLED

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
