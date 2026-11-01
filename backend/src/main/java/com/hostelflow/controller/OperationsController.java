package com.hostelflow.controller;

import com.hostelflow.dto.response.ApiResponse;
import com.hostelflow.model.*;
import com.hostelflow.repository.*;
import com.hostelflow.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class OperationsController {

    private final UserRepository users;
    private final HostelComplaintRepository complaints;
    private final HostelFeedbackRepository feedbacks;
    private final MaintenanceTaskRepository maintenanceRepo;
    private final StudentIncidentRepository incidentRepo;
    private final FoodFeedbackRepository foodFeedbackRepo;
    private final NotificationService notifications;

    private User actor(UserDetails details) {
        return users.findByEmail(details.getUsername()).orElseThrow();
    }

    // ── Student Complaints ──

    @PostMapping("/student/complaints")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<HostelComplaint>> submit(
            @AuthenticationPrincipal UserDetails details,
            @RequestBody Map<String, String> body) {
        User student = actor(details);
        String category = body.getOrDefault("category", "OTHER").trim().toUpperCase();
        if (body.getOrDefault("description", "").isBlank()) {
            throw new IllegalArgumentException("Description is required");
        }

        boolean isFood = Set.of("FOOD_QUALITY", "HYGIENE", "INSECTS", "INSUFFICIENT_QUANTITY", "UNDERCOOKED_FOOD")
                .contains(category);

        HostelComplaint c = HostelComplaint.builder()
                .studentId(student.getId())
                .studentName(student.getFullName())
                .rollNumber(student.getRollNumber())
                .roomNumber(student.getRoomNumber())
                .hostelBlock(student.getHostelBlock() != null ? student.getHostelBlock() : "A")
                .category(category)
                .priority(body.getOrDefault("priority", "NORMAL").toUpperCase())
                .subject(body.getOrDefault("subject", category.replace("_", " ") + " complaint"))
                .description(body.get("description"))
                .attachmentUrl(body.get("attachmentUrl"))
                .isFoodRelated(isFood)
                .status("SUBMITTED")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .history(new ArrayList<>(List.of(
                        HostelComplaint.ComplaintAction.builder()
                                .actorId(student.getId())
                                .actorName(student.getFullName())
                                .action("SUBMITTED")
                                .note(body.get("description"))
                                .at(LocalDateTime.now())
                                .build()
                )))
                .build();

        complaints.save(c);

        notifications.notifyWardens(
                Notification.NotificationType.ESCALATION,
                "New Hostel Complaint: " + category,
                student.getFullName() + " (Room " + student.getRoomNumber() + ") submitted: " + c.getSubject(),
                c.getId()
        );

        return ResponseEntity.ok(ApiResponse.ok("Complaint submitted", c));
    }

    @GetMapping("/student/complaints")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<HostelComplaint>>> ownComplaints(@AuthenticationPrincipal UserDetails details) {
        return ResponseEntity.ok(ApiResponse.ok(complaints.findByStudentIdOrderByCreatedAtDesc(actor(details).getId())));
    }

    // ── Student Weekly Feedback ──

    @PostMapping("/student/feedback")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<HostelFeedback>> submitFeedback(
            @AuthenticationPrincipal UserDetails details,
            @RequestBody HostelFeedback input) {
        User student = actor(details);
        if (input.getWeekStart() == null || input.getWeekStart().isBlank()) {
            throw new IllegalArgumentException("weekStart is required (YYYY-MM-DD)");
        }
        if (feedbacks.existsByStudentIdAndWeekStart(student.getId(), input.getWeekStart())) {
            throw new IllegalArgumentException("Feedback already submitted for this week");
        }

        input.setId(null);
        input.setStudentId(student.getId());
        input.setStudentName(student.getFullName());
        input.setRollNumber(student.getRollNumber());
        input.setRoomNumber(student.getRoomNumber());
        input.setHostelBlock(student.getHostelBlock() != null ? student.getHostelBlock() : "A");
        input.setCreatedAt(LocalDateTime.now());

        return ResponseEntity.ok(ApiResponse.ok("Weekly feedback submitted", feedbacks.save(input)));
    }

    @GetMapping("/student/feedback/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<HostelFeedback>>> ownFeedback(@AuthenticationPrincipal UserDetails details) {
        return ResponseEntity.ok(ApiResponse.ok(feedbacks.findByStudentIdOrderByCreatedAtDesc(actor(details).getId())));
    }

    // ── Warden / Admin Complaints ──

    @GetMapping("/warden/complaints")
    @PreAuthorize("hasAnyRole('WARDEN','ADMIN')")
    public ResponseEntity<ApiResponse<List<HostelComplaint>>> allComplaints(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean foodOnly) {
        List<HostelComplaint> list = complaints.findAllByOrderByCreatedAtDesc();
        if (category != null && !category.isBlank()) {
            list = list.stream().filter(c -> category.equalsIgnoreCase(c.getCategory())).toList();
        }
        if (status != null && !status.isBlank()) {
            list = list.stream().filter(c -> status.equalsIgnoreCase(c.getStatus())).toList();
        }
        if (Boolean.TRUE.equals(foodOnly)) {
            list = list.stream().filter(HostelComplaint::isFoodRelated).toList();
        }
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PatchMapping("/warden/complaints/{id}")
    @PreAuthorize("hasAnyRole('WARDEN','ADMIN')")
    public ResponseEntity<ApiResponse<HostelComplaint>> updateComplaint(
            @AuthenticationPrincipal UserDetails details,
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        User warden = actor(details);
        HostelComplaint c = complaints.findById(id).orElseThrow();
        String status = body.getOrDefault("status", c.getStatus()).toUpperCase();

        if (!Set.of("SUBMITTED", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "REOPENED").contains(status)) {
            throw new IllegalArgumentException("Invalid complaint status");
        }

        c.setStatus(status);
        if (body.containsKey("assignedTo")) c.setAssignedTo(body.get("assignedTo"));
        if (body.containsKey("assignedStaffName")) c.setAssignedStaffName(body.get("assignedStaffName"));
        if (body.containsKey("resolutionNotes")) c.setResolutionNotes(body.get("resolutionNotes"));
        if ("RESOLVED".equals(status)) c.setVerifiedBy(warden.getFullName());
        c.setUpdatedAt(LocalDateTime.now());

        c.getHistory().add(HostelComplaint.ComplaintAction.builder()
                .actorId(warden.getId())
                .actorName(warden.getFullName())
                .action(status)
                .note(body.getOrDefault("note", body.getOrDefault("resolutionNotes", "Status changed to " + status)))
                .at(LocalDateTime.now())
                .build());

        complaints.save(c);

        notifications.createNotification(
                c.getStudentId(),
                Notification.NotificationType.COMPLAINT_UPDATE,
                "Complaint Status: " + status,
                "Your complaint '" + c.getSubject() + "' status is now " + status
                        + (c.getResolutionNotes() != null ? ". Notes: " + c.getResolutionNotes() : ""),
                c.getId()
        );

        return ResponseEntity.ok(ApiResponse.ok("Complaint updated", c));
    }

    @GetMapping("/warden/feedback")
    @PreAuthorize("hasAnyRole('WARDEN','ADMIN')")
    public ResponseEntity<ApiResponse<List<HostelFeedback>>> allFeedback() {
        return ResponseEntity.ok(ApiResponse.ok(feedbacks.findAllByOrderByCreatedAtDesc()));
    }

    // ── Admin Operations View ──

    @GetMapping("/admin/operations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> adminOperations() {
        Map<String, Object> result = new HashMap<>();
        List<HostelComplaint> allComplaints = complaints.findAllByOrderByCreatedAtDesc();
        List<HostelFeedback> allFeedback = feedbacks.findAllByOrderByCreatedAtDesc();
        List<MaintenanceTask> allTasks = maintenanceRepo.findAllByOrderByCreatedAtDesc();
        List<StudentIncident> allIncidents = incidentRepo.findAllByOrderByCreatedAtDesc();
        List<FoodFeedback> foodFeedbacks = foodFeedbackRepo.findAllByOrderByCreatedAtDesc();

        long openComplaints = allComplaints.stream()
                .filter(c -> Set.of("SUBMITTED", "ASSIGNED", "IN_PROGRESS", "REOPENED").contains(c.getStatus()))
                .count();

        long resolvedComplaints = allComplaints.stream()
                .filter(c -> "RESOLVED".equalsIgnoreCase(c.getStatus()))
                .count();

        double resolutionRate = allComplaints.isEmpty() ? 100.0 :
                Math.round(((double) resolvedComplaints / allComplaints.size() * 100.0) * 10.0) / 10.0;

        result.put("complaints", allComplaints);
        result.put("feedback", allFeedback);
        result.put("maintenanceTasks", allTasks);
        result.put("incidents", allIncidents);
        result.put("foodFeedback", foodFeedbacks);
        result.put("openComplaints", openComplaints);
        result.put("resolvedComplaints", resolvedComplaints);
        result.put("resolutionRate", resolutionRate);
        result.put("totalUsers", users.count());
        result.put("totalStudents", users.countByRole(User.Role.STUDENT));

        return ResponseEntity.ok(ApiResponse.ok(result));
    }
}
