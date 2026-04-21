package com.hostelflow.controller;

import com.hostelflow.dto.request.LeaveDTOs.*;
import com.hostelflow.dto.response.ApiResponse;
import com.hostelflow.model.*;
import com.hostelflow.repository.*;
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
@RequestMapping("/api/parent")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PARENT')")
public class ParentController {

    private final LeaveService leaveService;
    private final NotificationService notificationService;
    private final UserRepository userRepo;
    private final LeaveRequestRepository leaveRepo;

    private User getUser(UserDetails ud) {
        return userRepo.findByEmail(ud.getUsername()).orElseThrow();
    }

    @PostMapping("/leave/approve")
    public ResponseEntity<ApiResponse<LeaveRequest>> approveLeave(
            @AuthenticationPrincipal UserDetails ud,
            @Valid @RequestBody ParentApprovalRequest req) {
        User parent = getUser(ud);
        return ResponseEntity.ok(ApiResponse.ok("Action applied",
                leaveService.parentAction(parent.getId(), req)));
    }

    @GetMapping("/student/profile")
    public ResponseEntity<ApiResponse<User>> getLinkedStudent(@AuthenticationPrincipal UserDetails ud) {
        User parent = getUser(ud);
        if (parent.getLinkedStudentId() == null) throw new RuntimeException("No linked student");
        User student = userRepo.findById(parent.getLinkedStudentId()).orElseThrow();
        return ResponseEntity.ok(ApiResponse.ok(student));
    }

    @GetMapping("/student/leaves")
    public ResponseEntity<ApiResponse<Page<LeaveRequest>>> getStudentLeaves(
            @AuthenticationPrincipal UserDetails ud,
            @RequestParam(defaultValue = "0") int page) {
        User parent = getUser(ud);
        return ResponseEntity.ok(ApiResponse.ok(
                leaveService.getStudentHistory(parent.getLinkedStudentId(), page, 15)));
    }

    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<?>> getNotifications(
            @AuthenticationPrincipal UserDetails ud,
            @RequestParam(defaultValue = "0") int page) {
        User parent = getUser(ud);
        return ResponseEntity.ok(ApiResponse.ok(
                notificationService.getUserNotifications(parent.getId(), page, 20)));
    }

    @PatchMapping("/notifications/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllRead(@AuthenticationPrincipal UserDetails ud) {
        User parent = getUser(ud);
        notificationService.markAllRead(parent.getId());
        return ResponseEntity.ok(ApiResponse.ok("Marked all read", null));
    }
}
