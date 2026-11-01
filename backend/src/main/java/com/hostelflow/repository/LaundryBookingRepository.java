package com.hostelflow.repository;

import com.hostelflow.model.LaundryBooking;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.time.LocalDate;
import java.util.List;

public interface LaundryBookingRepository extends MongoRepository<LaundryBooking, String> {
    List<LaundryBooking> findByBookingDate(LocalDate date);
    List<LaundryBooking> findByStudentIdOrderByCreatedAtDesc(String studentId);
    boolean existsByMachineNumberAndBookingDateAndTimeSlotAndStatus(String machineNumber, LocalDate date, String timeSlot, String status);
}
