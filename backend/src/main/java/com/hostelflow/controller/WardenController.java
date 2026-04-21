package com.hostelflow.controller;

import com.hostelflow.dto.request.LeaveDTOs.*;
import com.hostelflow.dto.response.ApiResponse;
import com.hostelflow.model.*;
import com.hostelflow.repository.UserRepository;
import com.hostelflow.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/warden")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('WARDEN','ADMIN')")
public class WardenController {

    private final LeaveService leaveService;
    private final AnalyticsService analyticsService;
    private final NotificationService notificationService;
    private final UserRepository userRepo;

    private User getUser(UserDetails ud) {
        return userRepo.findByEmail(ud.getUsername()).orElseThrow();
    }

    // ── Leave Management ──

    @GetMapping("/leaves")
    public ResponseEntity<ApiResponse<Page<LeaveRequest>>> getLeaves(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(leaveService.getAllRequests(status, page, size)));
    }

    @PostMapping("/leaves/{leaveId}/action")
    public ResponseEntity<ApiResponse<LeaveRequest>> action(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable String leaveId,
            @Valid @RequestBody ApproveRejectRequest req) {
        User warden = getUser(ud);
        return ResponseEntity.ok(ApiResponse.ok("Action applied",
                leaveService.wardenAction(leaveId, warden.getId(), req)));
    }

    @GetMapping("/leaves/currently-out")
    public ResponseEntity<ApiResponse<List<LeaveRequest>>> currentlyOut() {
        return ResponseEntity.ok(ApiResponse.ok(leaveService.getCurrentlyOut()));
    }

    // ── Analytics ──

    @GetMapping("/dashboard/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getWardenDashboardStats()));
    }

    @GetMapping("/students/high-risk")
    public ResponseEntity<ApiResponse<List<User>>> getHighRiskStudents() {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getHighRiskStudents()));
    }

    @GetMapping("/students/all")
    public ResponseEntity<ApiResponse<List<User>>> getAllStudents() {
        return ResponseEntity.ok(ApiResponse.ok(userRepo.findByRole(User.Role.STUDENT)));
    }

    @GetMapping("/students/{studentId}/leaves")
    public ResponseEntity<ApiResponse<Page<LeaveRequest>>> getStudentLeaves(
            @PathVariable String studentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(leaveService.getStudentHistory(studentId, page, size)));
    }

    // ── Notifications ──

    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<?>> getNotifications(
            @AuthenticationPrincipal UserDetails ud,
            @RequestParam(defaultValue = "0") int page) {
        User warden = getUser(ud);
        return ResponseEntity.ok(ApiResponse.ok(notificationService.getUserNotifications(warden.getId(), page, 20)));
    }

    @PatchMapping("/notifications/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllRead(@AuthenticationPrincipal UserDetails ud) {
        User warden = getUser(ud);
        notificationService.markAllRead(warden.getId());
        return ResponseEntity.ok(ApiResponse.ok("Marked all read", null));
    }
}
