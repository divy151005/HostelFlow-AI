package com.hostelflow.service;

import com.hostelflow.model.Notification;
import com.hostelflow.model.User;
import com.hostelflow.model.VisitorPass;
import com.hostelflow.repository.UserRepository;
import com.hostelflow.repository.VisitorPassRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class VisitorPassService {

    private final VisitorPassRepository visitorRepo;
    private final UserRepository userRepo;
    private final NotificationService notificationService;

    public VisitorPass applyVisitorPass(String studentId, VisitorPass pass) {
        User student = userRepo.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        String passCode = String.format("%04d", new Random().nextInt(10000));
        String qrToken = "VIS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        pass.setStudentId(studentId);
        pass.setStudentName(student.getFullName());
        pass.setStudentRoll(student.getRollNumber());
        pass.setStudentRoom(student.getRoomNumber());
        pass.setPassCode(passCode);
        pass.setQrToken(qrToken);
        pass.setStatus("PENDING");
        pass.setCreatedAt(LocalDateTime.now());

        VisitorPass saved = visitorRepo.save(pass);

        notificationService.notifyWardens(
                Notification.NotificationType.ANNOUNCEMENT,
                "New Visitor Pass Application",
                student.getFullName() + " applied for a visitor pass for " + pass.getVisitorName() + " (" + pass.getRelationship() + ").",
                saved.getId()
        );

        return saved;
    }

    public List<VisitorPass> getStudentVisitorPasses(String studentId) {
        return visitorRepo.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    public List<VisitorPass> getAllVisitorPasses() {
        return visitorRepo.findAllByOrderByCreatedAtDesc();
    }

    public VisitorPass approveVisitorPass(String passId, boolean approved, String remarks) {
        VisitorPass pass = visitorRepo.findById(passId)
                .orElseThrow(() -> new RuntimeException("Visitor pass not found"));

        pass.setStatus(approved ? "APPROVED" : "REJECTED");
        pass.setWardenRemarks(remarks);
        VisitorPass saved = visitorRepo.save(pass);

        if (approved) {
            notificationService.createNotification(
                    pass.getStudentId(),
                    Notification.NotificationType.VISITOR_PASS_APPROVED,
                    "Visitor Pass Approved! ✅",
                    "Visitor pass for " + pass.getVisitorName() + " is approved. Pass code: " + pass.getPassCode(),
                    saved.getId()
            );
        }

        return saved;
    }

    public VisitorPass processGateAction(String codeOrToken, String action) {
        VisitorPass pass = visitorRepo.findByPassCode(codeOrToken)
                .or(() -> visitorRepo.findByQrToken(codeOrToken))
                .orElseThrow(() -> new RuntimeException("Invalid Visitor Pass Code or Token: " + codeOrToken));

        if (!"APPROVED".equals(pass.getStatus()) && !"CHECKED_IN".equals(pass.getStatus())) {
            throw new RuntimeException("Pass is not in an approved/active state (Current: " + pass.getStatus() + ")");
        }

        LocalDateTime now = LocalDateTime.now();
        if ("ENTRY".equalsIgnoreCase(action) || "IN".equalsIgnoreCase(action)) {
            pass.setStatus("CHECKED_IN");
            pass.setCheckedInAt(now);
            notificationService.createNotification(
                    pass.getStudentId(),
                    Notification.NotificationType.VISITOR_PASS_APPROVED,
                    "Visitor Arrived at Gate 🚪",
                    pass.getVisitorName() + " checked in at the main gate at " + now.toLocalTime(),
                    pass.getId()
            );
        } else {
            pass.setStatus("COMPLETED");
            pass.setCheckedOutAt(now);
            notificationService.createNotification(
                    pass.getStudentId(),
                    Notification.NotificationType.VISITOR_PASS_APPROVED,
                    "Visitor Departed 👋",
                    pass.getVisitorName() + " checked out of hostel premises at " + now.toLocalTime(),
                    pass.getId()
            );
        }

        return visitorRepo.save(pass);
    }
}
