package com.hostelflow.service;

import com.hostelflow.model.Notification;
import com.hostelflow.model.StudentIncident;
import com.hostelflow.model.User;
import com.hostelflow.repository.StudentIncidentRepository;
import com.hostelflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class IncidentService {

    private final StudentIncidentRepository incidentRepo;
    private final UserRepository userRepo;
    private final NotificationService notificationService;

    public StudentIncident registerIncident(User warden, String studentId, StudentIncident.IncidentType type,
                                             StudentIncident.Severity severity, String title, String description) {
        User student = userRepo.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        LocalDateTime now = LocalDateTime.now();
        StudentIncident incident = StudentIncident.builder()
                .studentId(student.getId())
                .studentName(student.getFullName())
                .rollNumber(student.getRollNumber())
                .roomNumber(student.getRoomNumber())
                .hostelBlock(student.getHostelBlock())
                .reportedById(warden.getId())
                .reportedByName(warden.getFullName())
                .type(type)
                .severity(severity != null ? severity : StudentIncident.Severity.MEDIUM)
                .title(title)
                .description(description)
                .status(StudentIncident.Status.REPORTED)
                .parentNotified(true)
                .mentorNotified(true)
                .createdAt(now)
                .updatedAt(now)
                .history(new ArrayList<>(List.of(
                        StudentIncident.IncidentAction.builder()
                                .actorId(warden.getId())
                                .actorName(warden.getFullName())
                                .action("REPORTED")
                                .note("Incident registered by " + warden.getFullName() + ": " + title)
                                .at(now)
                                .build()
                )))
                .build();

        StudentIncident saved = incidentRepo.save(incident);

        // 1. Notify Student
        notificationService.createNotification(
                student.getId(),
                Notification.NotificationType.INCIDENT_NOTICE,
                "Incident Notice Issued",
                "A formal notice has been registered regarding: " + title + ". Please review and submit your explanation.",
                saved.getId()
        );

        // 2. Notify Parent
        notificationService.notifyLinkedParent(
                student.getId(),
                Notification.NotificationType.INCIDENT_NOTICE,
                "Notice Concerning " + student.getFullName(),
                "A hostel incident notice has been recorded: " + title + " (" + type + ").",
                saved.getId()
        );

        // 3. Notify Mentor
        notificationService.notifyStudentMentor(
                student.getId(),
                Notification.NotificationType.INCIDENT_NOTICE,
                "Incident Notice: " + student.getFullName(),
                "A notice has been issued for your mentee: " + title + ".",
                saved.getId()
        );

        // 4. Notify Admins
        notificationService.notifyAdmins(
                Notification.NotificationType.INCIDENT_NOTICE,
                "Hostel Incident Logged",
                warden.getFullName() + " logged an incident for " + student.getFullName() + " (" + type + ")",
                saved.getId()
        );

        return saved;
    }

    public StudentIncident submitExplanation(User student, String incidentId, String explanation) {
        StudentIncident incident = incidentRepo.findById(incidentId)
                .orElseThrow(() -> new IllegalArgumentException("Incident not found"));

        if (!incident.getStudentId().equals(student.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized");
        }

        LocalDateTime now = LocalDateTime.now();
        incident.setStudentExplanation(explanation);
        incident.setStudentExplanationAt(now);
        incident.setStatus(StudentIncident.Status.EXPLANATION_SUBMITTED);
        incident.setUpdatedAt(now);
        incident.getHistory().add(
                StudentIncident.IncidentAction.builder()
                        .actorId(student.getId())
                        .actorName(student.getFullName())
                        .action("EXPLANATION_SUBMITTED")
                        .note("Student submitted explanation: " + explanation)
                        .at(now)
                        .build()
        );

        StudentIncident saved = incidentRepo.save(incident);

        // Notify Warden
        notificationService.createNotification(
                incident.getReportedById(),
                Notification.NotificationType.INCIDENT_NOTICE,
                "Student Explanation Received",
                student.getFullName() + " submitted an explanation for incident: " + incident.getTitle(),
                saved.getId()
        );

        return saved;
    }

    public StudentIncident recordAction(User warden, String incidentId, String actionNote, String status) {
        StudentIncident incident = incidentRepo.findById(incidentId)
                .orElseThrow(() -> new IllegalArgumentException("Incident not found"));

        LocalDateTime now = LocalDateTime.now();
        incident.setWardenAction(actionNote);
        incident.setWardenActionAt(now);
        incident.setResolvedBy(warden.getFullName());
        incident.setUpdatedAt(now);

        StudentIncident.Status newStatus = StudentIncident.Status.CLOSED;
        if ("UNDER_REVIEW".equalsIgnoreCase(status)) newStatus = StudentIncident.Status.UNDER_REVIEW;
        else if ("ACTION_TAKEN".equalsIgnoreCase(status)) newStatus = StudentIncident.Status.ACTION_TAKEN;
        incident.setStatus(newStatus);

        incident.getHistory().add(
                StudentIncident.IncidentAction.builder()
                        .actorId(warden.getId())
                        .actorName(warden.getFullName())
                        .action(newStatus.name())
                        .note("Action recorded by " + warden.getFullName() + ": " + actionNote)
                        .at(now)
                        .build()
        );

        StudentIncident saved = incidentRepo.save(incident);

        // Notify Student
        notificationService.createNotification(
                incident.getStudentId(),
                Notification.NotificationType.INCIDENT_NOTICE,
                "Incident Resolved / Action Updated",
                "Action recorded for incident '" + incident.getTitle() + "': " + actionNote,
                saved.getId()
        );

        return saved;
    }

    public List<StudentIncident> getAllIncidents() {
        return incidentRepo.findAllByOrderByCreatedAtDesc();
    }

    public List<StudentIncident> getStudentIncidents(String studentId) {
        return incidentRepo.findByStudentIdOrderByCreatedAtDesc(studentId);
    }
}
