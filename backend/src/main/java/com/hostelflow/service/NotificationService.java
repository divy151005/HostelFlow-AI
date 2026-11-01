package com.hostelflow.service;

import com.hostelflow.model.*;
import com.hostelflow.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notifRepo;
    private final UserRepository userRepo;

    public Notification createNotification(String userId, Notification.NotificationType type,
                                            String title, String message, String referenceId) {
        if (userId == null) return null;
        Notification n = Notification.builder()
                .userId(userId)
                .type(type)
                .title(title)
                .message(message)
                .referenceId(referenceId)
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();
        return notifRepo.save(n);
    }

    public void notifyWardens(Notification.NotificationType type, String title,
                               String message, String referenceId) {
        notifyRole(User.Role.WARDEN, type, title, message, referenceId);
    }

    public void notifyMentors(Notification.NotificationType type, String title,
                               String message, String referenceId) {
        notifyRole(User.Role.MENTOR, type, title, message, referenceId);
    }

    public void notifyAdmins(Notification.NotificationType type, String title,
                             String message, String referenceId) {
        notifyRole(User.Role.ADMIN, type, title, message, referenceId);
    }

    public void notifyLinkedParent(String studentId, Notification.NotificationType type,
                                   String title, String message, String referenceId) {
        userRepo.findByLinkedStudentId(studentId).ifPresent(parent ->
            createNotification(parent.getId(), type, title, message, referenceId)
        );
    }

    public void notifyStudentMentor(String studentId, Notification.NotificationType type,
                                    String title, String message, String referenceId) {
        userRepo.findById(studentId).ifPresent(student -> {
            if (student.getMentorEmail() != null && !student.getMentorEmail().isBlank()) {
                userRepo.findByEmail(student.getMentorEmail()).ifPresent(mentor ->
                    createNotification(mentor.getId(), type, title, message, referenceId)
                );
            }
        });
    }

    private void notifyRole(User.Role role, Notification.NotificationType type, String title,
                            String message, String referenceId) {
        List<User> users = userRepo.findByRole(role);
        users.forEach(user -> createNotification(user.getId(), type, title, message, referenceId));
    }

    public Page<Notification> getUserNotifications(String userId, int page, int size) {
        return notifRepo.findByUserIdOrderByCreatedAtDesc(
                userId, PageRequest.of(page, size));
    }

    public long getUnreadCount(String userId) {
        return notifRepo.countByUserIdAndRead(userId, false);
    }

    public void markAllRead(String userId) {
        List<Notification> unread = notifRepo.findByUserIdAndRead(userId, false);
        unread.forEach(n -> n.setRead(true));
        notifRepo.saveAll(unread);
    }

    public void markRead(String notifId) {
        notifRepo.findById(notifId).ifPresent(n -> {
            n.setRead(true);
            notifRepo.save(n);
        });
    }
}
