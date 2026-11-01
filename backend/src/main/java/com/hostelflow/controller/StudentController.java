package com.hostelflow.controller;

import com.hostelflow.dto.request.LeaveDTOs.*;
import com.hostelflow.dto.response.ApiResponse;
import com.hostelflow.model.*;
import com.hostelflow.repository.HostelComplaintRepository;
import com.hostelflow.repository.UserRepository;
import com.hostelflow.service.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
public class StudentController {

    private final LeaveService leaveService;
    private final NotificationService notificationService;
    private final SupervisionService supervisionService;
    private final IncidentService incidentService;
    private final CampusNetworkService campusNetworkService;
    private final HostelComplaintRepository complaintRepo;
    private final UserRepository userRepo;

    private User getUser(UserDetails ud) {
        return userRepo.findByEmail(ud.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping("/leave/apply")
    public ResponseEntity<ApiResponse<LeaveRequest>> applyLeave(
            @AuthenticationPrincipal UserDetails ud,
            HttpServletRequest request,
            @Valid @RequestBody CreateLeaveRequest req) {
        User student = getUser(ud);
        if ("OUTING".equalsIgnoreCase(req.getType())) {
            campusNetworkService.enforceCampusWifiForOuting(request, req.getWifiSsid(), req.isSimulateCellular());
        }
        return ResponseEntity.ok(ApiResponse.ok("Leave applied", leaveService.applyLeave(student.getId(), req)));
    }

    @GetMapping("/network-status")
    public ResponseEntity<ApiResponse<CampusNetworkService.NetworkVerificationResult>> getNetworkStatus(
            HttpServletRequest request,
            @RequestParam(required = false) String wifiSsid,
            @RequestParam(required = false, defaultValue = "false") boolean simulateCellular) {
        return ResponseEntity.ok(ApiResponse.ok("Network status verified",
                campusNetworkService.verifyNetwork(request, wifiSsid, simulateCellular)));
    }

    @GetMapping("/leave/history")
    public ResponseEntity<ApiResponse<Page<LeaveRequest>>> getHistory(
            @AuthenticationPrincipal UserDetails ud,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        User student = getUser(ud);
        return ResponseEntity.ok(ApiResponse.ok(leaveService.getStudentHistory(student.getId(), page, size)));
    }

    @DeleteMapping("/leave/{leaveId}/cancel")
    public ResponseEntity<ApiResponse<LeaveRequest>> cancelLeave(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable String leaveId) {
        User student = getUser(ud);
        return ResponseEntity.ok(ApiResponse.ok("Leave cancelled", leaveService.cancelLeave(leaveId, student.getId())));
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<User>> getProfile(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(ApiResponse.ok(getUser(ud)));
    }

    // ── Student Activity & Presence ──
    @GetMapping("/activity")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getActivity(@AuthenticationPrincipal UserDetails ud) {
        User student = getUser(ud);
        return ResponseEntity.ok(ApiResponse.ok(supervisionService.getStudentActivity(student.getId())));
    }

    // ── Emergency SOS ──
    @PostMapping("/sos")
    public ResponseEntity<ApiResponse<Map<String, Object>>> triggerSOS(
            @AuthenticationPrincipal UserDetails ud,
            @RequestBody(required = false) Map<String, String> body) {
        User student = getUser(ud);
        String location = body != null ? body.get("location") : "Hostel Campus";
        String note = body != null ? body.get("note") : "Immediate emergency assistance requested";
        return ResponseEntity.ok(ApiResponse.ok("Emergency SOS Alert Dispatched!",
                supervisionService.triggerEmergencySOS(student, location, note)));
    }

    // ── Reopen Complaint ──
    @PostMapping("/complaints/{id}/reopen")
    public ResponseEntity<ApiResponse<HostelComplaint>> reopenComplaint(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        User student = getUser(ud);
        HostelComplaint complaint = complaintRepo.findById(id).orElseThrow();
        if (!student.getId().equals(complaint.getStudentId())) {
            throw new org.springframework.security.access.AccessDeniedException("Not your complaint");
        }
        String reason = body.getOrDefault("reason", "Issue not fully resolved");
        complaint.setStatus("REOPENED");
        complaint.setReopenedReason(reason);
        complaint.setReopenedAt(LocalDateTime.now());
        complaint.setUpdatedAt(LocalDateTime.now());
        complaint.getHistory().add(HostelComplaint.ComplaintAction.builder()
                .actorId(student.getId())
                .actorName(student.getFullName())
                .action("REOPENED")
                .note("Student reopened complaint: " + reason)
                .at(LocalDateTime.now())
                .build());
        complaintRepo.save(complaint);

        notificationService.notifyWardens(
                Notification.NotificationType.ESCALATION,
                "Complaint Reopened",
                student.getFullName() + " reopened complaint: " + complaint.getSubject(),
                complaint.getId()
        );

        return ResponseEntity.ok(ApiResponse.ok("Complaint reopened", complaint));
    }

    // ── Incidents & Explanations ──
    @GetMapping("/incidents/my")
    public ResponseEntity<ApiResponse<List<StudentIncident>>> getMyIncidents(@AuthenticationPrincipal UserDetails ud) {
        User student = getUser(ud);
        return ResponseEntity.ok(ApiResponse.ok(incidentService.getStudentIncidents(student.getId())));
    }

    @PostMapping("/incidents/{id}/explanation")
    public ResponseEntity<ApiResponse<StudentIncident>> submitIncidentExplanation(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        User student = getUser(ud);
        String explanation = body.getOrDefault("explanation", "");
        return ResponseEntity.ok(ApiResponse.ok("Explanation submitted",
                incidentService.submitExplanation(student, id, explanation)));
    }

    // ── Notifications ──
    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<?>> getNotifications(
            @AuthenticationPrincipal UserDetails ud,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User student = getUser(ud);
        return ResponseEntity.ok(ApiResponse.ok(notificationService.getUserNotifications(student.getId(), page, size)));
    }

    @GetMapping("/notifications/unread-count")
    public ResponseEntity<ApiResponse<Long>> unreadCount(@AuthenticationPrincipal UserDetails ud) {
        User student = getUser(ud);
        return ResponseEntity.ok(ApiResponse.ok(notificationService.getUnreadCount(student.getId())));
    }

    @PatchMapping("/notifications/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllRead(@AuthenticationPrincipal UserDetails ud) {
        User student = getUser(ud);
        notificationService.markAllRead(student.getId());
        return ResponseEntity.ok(ApiResponse.ok("Marked all read", null));
    }

    @PutMapping("/fcm-token")
    public ResponseEntity<ApiResponse<Void>> updateFcmToken(
            @AuthenticationPrincipal UserDetails ud,
            @RequestBody java.util.Map<String, String> body) {
        User student = getUser(ud);
        student.setFcmToken(body.get("fcmToken"));
        userRepo.save(student);
        return ResponseEntity.ok(ApiResponse.ok("FCM token updated", null));
    }
}
