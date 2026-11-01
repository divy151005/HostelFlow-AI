package com.hostelflow.service;

import com.hostelflow.model.ChatMessage;
import com.hostelflow.model.Notification;
import com.hostelflow.model.User;
import com.hostelflow.repository.ChatMessageRepository;
import com.hostelflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatRepo;
    private final UserRepository userRepo;
    private final NotificationService notificationService;

    public String generateConversationId(String id1, String id2) {
        return id1.compareTo(id2) < 0 ? id1 + "_" + id2 : id2 + "_" + id1;
    }

    public List<Map<String, Object>> getContacts(User user) {
        List<Map<String, Object>> contacts = new ArrayList<>();

        if (user.getRole() == User.Role.STUDENT) {
            // Mentor
            if (user.getMentorEmail() != null && !user.getMentorEmail().isBlank()) {
                userRepo.findByEmail(user.getMentorEmail()).ifPresent(mentor -> {
                    contacts.add(buildContactMap(user.getId(), mentor, "Assigned Mentor"));
                });
            }
            // Wardens
            List<User> wardens = userRepo.findByRole(User.Role.WARDEN);
            for (User w : wardens) {
                contacts.add(buildContactMap(user.getId(), w, "Hostel Warden"));
            }
        } else if (user.getRole() == User.Role.MENTOR) {
            // Assigned students
            List<User> students = userRepo.findByMentorEmail(user.getEmail());
            for (User s : students) {
                contacts.add(buildContactMap(user.getId(), s, "Student (Roll: " + s.getRollNumber() + ")"));
            }
        } else if (user.getRole() == User.Role.WARDEN) {
            // Parents of students
            List<User> parents = userRepo.findByRole(User.Role.PARENT);
            for (User p : parents) {
                String sub = "Parent";
                if (p.getLinkedStudentId() != null) {
                    Optional<User> stud = userRepo.findById(p.getLinkedStudentId());
                    if (stud.isPresent()) sub = "Parent of " + stud.get().getFullName() + " (" + stud.get().getRollNumber() + ")";
                }
                contacts.add(buildContactMap(user.getId(), p, sub));
            }
            // Students
            List<User> students = userRepo.findByRole(User.Role.STUDENT);
            for (User s : students) {
                contacts.add(buildContactMap(user.getId(), s, "Student (" + s.getRollNumber() + ", Room " + s.getRoomNumber() + ")"));
            }
        } else if (user.getRole() == User.Role.PARENT) {
            // Warden
            List<User> wardens = userRepo.findByRole(User.Role.WARDEN);
            for (User w : wardens) {
                contacts.add(buildContactMap(user.getId(), w, "Hostel Warden"));
            }
            // Child's Mentor
            if (user.getLinkedStudentId() != null) {
                userRepo.findById(user.getLinkedStudentId()).ifPresent(child -> {
                    if (child.getMentorEmail() != null) {
                        userRepo.findByEmail(child.getMentorEmail()).ifPresent(m -> {
                            contacts.add(buildContactMap(user.getId(), m, "Child's Mentor (" + child.getFullName() + ")"));
                        });
                    }
                });
            }
        } else if (user.getRole() == User.Role.ADMIN) {
            // All wardens and mentors
            List<User> staff = new ArrayList<>(userRepo.findByRole(User.Role.WARDEN));
            staff.addAll(userRepo.findByRole(User.Role.MENTOR));
            for (User u : staff) {
                contacts.add(buildContactMap(user.getId(), u, u.getRole().name()));
            }
        }

        return contacts;
    }

    private Map<String, Object> buildContactMap(String currentUserId, User otherUser, String roleLabel) {
        String convId = generateConversationId(currentUserId, otherUser.getId());
        long unread = chatRepo.countByConversationIdAndRecipientIdAndIsReadFalse(convId, currentUserId);

        Map<String, Object> map = new HashMap<>();
        map.put("id", otherUser.getId());
        map.put("fullName", otherUser.getFullName());
        map.put("email", otherUser.getEmail());
        map.put("phone", otherUser.getPhone());
        map.put("role", otherUser.getRole());
        map.put("roleLabel", roleLabel);
        map.put("conversationId", convId);
        map.put("unreadCount", unread);
        return map;
    }

    public List<ChatMessage> getMessages(User currentUser, String otherUserId) {
        String convId = generateConversationId(currentUser.getId(), otherUserId);
        // Mark as read
        List<ChatMessage> unread = chatRepo.findByConversationIdOrderByCreatedAtAsc(convId);
        boolean changed = false;
        for (ChatMessage m : unread) {
            if (currentUser.getId().equals(m.getRecipientId()) && !m.isRead()) {
                m.setRead(true);
                m.setReadAt(LocalDateTime.now());
                changed = true;
            }
        }
        if (changed) {
            chatRepo.saveAll(unread);
        }
        return unread;
    }

    public ChatMessage sendMessage(User sender, String recipientId, String content) {
        if (content == null || content.trim().isBlank()) {
            throw new IllegalArgumentException("Message content cannot be blank");
        }
        User recipient = userRepo.findById(recipientId)
                .orElseThrow(() -> new IllegalArgumentException("Recipient not found"));

        String convId = generateConversationId(sender.getId(), recipient.getId());

        ChatMessage msg = ChatMessage.builder()
                .conversationId(convId)
                .senderId(sender.getId())
                .senderName(sender.getFullName())
                .senderRole(sender.getRole().name())
                .recipientId(recipient.getId())
                .recipientName(recipient.getFullName())
                .recipientRole(recipient.getRole().name())
                .content(content.trim())
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        ChatMessage saved = chatRepo.save(msg);

        // Notify recipient
        notificationService.createNotification(
                recipient.getId(),
                Notification.NotificationType.NEW_MESSAGE,
                "New message from " + sender.getFullName(),
                content.length() > 60 ? content.substring(0, 57) + "..." : content,
                saved.getId()
        );

        return saved;
    }

    public long getUnreadCount(User user) {
        return chatRepo.countByRecipientIdAndIsReadFalse(user.getId());
    }
}
