package com.hostelflow.service;

import com.hostelflow.model.*;
import com.hostelflow.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class LateDetectionScheduler {

    private final LeaveRequestRepository leaveRepo;
    private final UserRepository userRepo;
    private final NotificationService notificationService;

    // Run every 5 minutes
    @Scheduled(fixedDelay = 300000)
    public void detectLateReturns() {
        LocalDateTime now = LocalDateTime.now();
        List<LeaveRequest> overdueList = leaveRepo.findOverdueRequests(now);

        overdueList.forEach(leave -> {
            if (!leave.isEscalated()) {
                long minutesLate = ChronoUnit.MINUTES.between(leave.getExpectedReturn(), now);
                log.warn("Student {} is {} minutes late — escalating", leave.getStudentName(), minutesLate);

                leave.setEscalated(true);
                leave.setLate(true);
                leave.setLateByMinutes(minutesLate);
                leaveRepo.save(leave);

                // Notify warden
                notificationService.notifyWardens(
                    Notification.NotificationType.LATE_RETURN,
                    "⚠️ Late Return Alert",
                    leave.getStudentName() + " is " + minutesLate + " mins overdue. Room: " + leave.getRoomNumber(),
                    leave.getId()
                );

                // Notify parent
                userRepo.findByLinkedStudentId(leave.getStudentId()).ifPresent(parent ->
                    notificationService.createNotification(
                        parent.getId(),
                        Notification.NotificationType.ESCALATION,
                        "Your child hasn't returned!",
                        leave.getStudentName() + " was expected at " + leave.getExpectedReturn() +
                        " but hasn't returned yet.",
                        leave.getId()
                    )
                );

                // Notify student
                notificationService.createNotification(
                    leave.getStudentId(),
                    Notification.NotificationType.LATE_RETURN,
                    "Return Overdue!",
                    "You are " + minutesLate + " minutes past your expected return time. Return immediately.",
                    leave.getId()
                );
            }
        });
    }
}
