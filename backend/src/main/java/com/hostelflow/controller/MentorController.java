package com.hostelflow.controller;

import com.hostelflow.dto.request.LeaveDTOs.ApproveRejectRequest;
import com.hostelflow.dto.response.ApiResponse;
import com.hostelflow.model.LeaveRequest;
import com.hostelflow.model.User;
import com.hostelflow.repository.UserRepository;
import com.hostelflow.service.LeaveService;
import com.hostelflow.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mentor")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('MENTOR','ADMIN')")
public class MentorController {

    private final LeaveService leaveService;
    private final NotificationService notificationService;
    private final UserRepository userRepo;

    private User getUser(UserDetails ud) {
        return userRepo.findByEmail(ud.getUsername()).orElseThrow();
    }

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
        User mentor = getUser(ud);
        return ResponseEntity.ok(ApiResponse.ok("Action applied",
                leaveService.mentorAction(leaveId, mentor.getId(), req)));
    }

    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<?>> getNotifications(
            @AuthenticationPrincipal UserDetails ud,
            @RequestParam(defaultValue = "0") int page) {
        User mentor = getUser(ud);
        return ResponseEntity.ok(ApiResponse.ok(notificationService.getUserNotifications(mentor.getId(), page, 20)));
    }

    @PatchMapping("/notifications/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllRead(@AuthenticationPrincipal UserDetails ud) {
        User mentor = getUser(ud);
        notificationService.markAllRead(mentor.getId());
        return ResponseEntity.ok(ApiResponse.ok("Marked all read", null));
    }
}
