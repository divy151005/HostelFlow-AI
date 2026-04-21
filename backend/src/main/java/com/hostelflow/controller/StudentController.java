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

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
public class StudentController {

    private final LeaveService leaveService;
    private final NotificationService notificationService;
    private final UserRepository userRepo;

    private User getUser(UserDetails ud) {
        return userRepo.findByEmail(ud.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping("/leave/apply")
    public ResponseEntity<ApiResponse<LeaveRequest>> applyLeave(
            @AuthenticationPrincipal UserDetails ud,
            @Valid @RequestBody CreateLeaveRequest req) {
        User student = getUser(ud);
        return ResponseEntity.ok(ApiResponse.ok("Leave applied", leaveService.applyLeave(student.getId(), req)));
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
