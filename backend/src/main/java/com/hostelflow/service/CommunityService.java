package com.hostelflow.service;

import com.hostelflow.model.*;
import com.hostelflow.repository.LaundryBookingRepository;
import com.hostelflow.repository.LostAndFoundRepository;
import com.hostelflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommunityService {

    private final LaundryBookingRepository laundryRepo;
    private final LostAndFoundRepository lostRepo;
    private final UserRepository userRepo;
    private final NotificationService notificationService;

    // ── Laundry Booking ──
    public LaundryBooking bookLaundrySlot(String studentId, String machineNumber, LocalDate date, String timeSlot) {
        if (laundryRepo.existsByMachineNumberAndBookingDateAndTimeSlotAndStatus(machineNumber, date, timeSlot, "BOOKED")) {
            throw new RuntimeException("Slot " + timeSlot + " on " + machineNumber + " is already booked for " + date);
        }

        User student = userRepo.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        LaundryBooking booking = LaundryBooking.builder()
                .studentId(studentId)
                .studentName(student.getFullName())
                .roomNumber(student.getRoomNumber())
                .machineNumber(machineNumber)
                .bookingDate(date)
                .timeSlot(timeSlot)
                .status("BOOKED")
                .createdAt(LocalDateTime.now())
                .build();

        LaundryBooking saved = laundryRepo.save(booking);

        notificationService.createNotification(
                studentId,
                Notification.NotificationType.LAUNDRY_REMINDER,
                "Laundry Slot Reserved 🧺",
                machineNumber + " reserved on " + date + " for " + timeSlot,
                saved.getId()
        );

        return saved;
    }

    public List<LaundryBooking> getLaundryBookings(LocalDate date) {
        return laundryRepo.findByBookingDate(date != null ? date : LocalDate.now());
    }

    public List<LaundryBooking> getStudentLaundry(String studentId) {
        return laundryRepo.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    public LaundryBooking cancelLaundry(String bookingId, String studentId) {
        LaundryBooking b = laundryRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        if (!studentId.equals(b.getStudentId())) {
            throw new RuntimeException("Unauthorized");
        }
        b.setStatus("CANCELLED");
        return laundryRepo.save(b);
    }

    // ── Lost & Found ──
    public LostAndFoundItem postLostAndFound(String studentId, LostAndFoundItem item) {
        User student = userRepo.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        item.setReportedByStudentId(studentId);
        item.setReporterName(student.getFullName());
        item.setContactInfo(student.getPhone() + " (" + student.getRoomNumber() + ")");
        item.setStatus("OPEN");
        item.setCreatedAt(LocalDateTime.now());

        return lostRepo.save(item);
    }

    public List<LostAndFoundItem> getLostAndFound() {
        return lostRepo.findAllByOrderByCreatedAtDesc();
    }

    public LostAndFoundItem claimItem(String itemId) {
        LostAndFoundItem item = lostRepo.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        item.setStatus("CLAIMED");
        return lostRepo.save(item);
    }
}
