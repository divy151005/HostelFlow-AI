package com.hostelflow.controller;

import com.hostelflow.dto.request.LeaveDTOs.ApproveRejectRequest;
import com.hostelflow.dto.response.ApiResponse;
import com.hostelflow.model.LeaveRequest;
import com.hostelflow.model.User;
import com.hostelflow.repository.UserRepository;
import com.hostelflow.repository.LeaveRequestRepository;
import com.hostelflow.service.LeaveService;
import com.hostelflow.service.NotificationService;
import com.hostelflow.service.SupervisionService;
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
@RequestMapping("/api/mentor")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('MENTOR','ADMIN')")
public class MentorController {

    private final LeaveService leaveService;
    private final NotificationService notificationService;
    private final SupervisionService supervisionService;
    private final UserRepository userRepo;
    private final LeaveRequestRepository leaveRepo;

    private User getUser(UserDetails ud) {
        return userRepo.findByEmail(ud.getUsername()).orElseThrow();
    }

    @GetMapping("/leaves")
    public ResponseEntity<ApiResponse<Page<LeaveRequest>>> getLeaves(
            @AuthenticationPrincipal UserDetails ud,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User mentor = getUser(ud);
        List<String> ids = userRepo.findByMentorEmail(mentor.getEmail()).stream().map(User::getId).toList();
        if (ids.isEmpty()) return ResponseEntity.ok(ApiResponse.ok(Page.empty()));
        var pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by("createdAt").descending());
        Page<LeaveRequest> result = status == null || status.isBlank()
                ? leaveRepo.findByStudentIdIn(ids, pageable)
                : leaveRepo.findByStudentIdInAndStatus(ids, LeaveRequest.Status.valueOf(status.toUpperCase()), pageable);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PostMapping("/leaves/{leaveId}/action")
    public ResponseEntity<ApiResponse<LeaveRequest>> action(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable String leaveId,
            @Valid @RequestBody ApproveRejectRequest req) {
        User mentor = getUser(ud);
        LeaveRequest leave = leaveRepo.findById(leaveId).orElseThrow();
        boolean assigned = userRepo.findByMentorEmail(mentor.getEmail()).stream().anyMatch(s -> s.getId().equals(leave.getStudentId()));
        if (!assigned && mentor.getRole() != User.Role.ADMIN) {
            throw new org.springframework.security.access.AccessDeniedException("Student is not assigned to this mentor");
        }
        return ResponseEntity.ok(ApiResponse.ok("Action applied",
                leaveService.mentorAction(leaveId, mentor.getId(), req)));
    }

    @GetMapping("/students")
    public ResponseEntity<ApiResponse<List<User>>> students(@AuthenticationPrincipal UserDetails ud) {
        User mentor = getUser(ud);
        return ResponseEntity.ok(ApiResponse.ok(userRepo.findByMentorEmail(mentor.getEmail())));
    }

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAnalytics(@AuthenticationPrincipal UserDetails ud) {
        User mentor = getUser(ud);
        return ResponseEntity.ok(ApiResponse.ok(supervisionService.getMentorAnalytics(mentor)));
    }

    @GetMapping("/students/{studentId}/activity")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStudentActivity(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable String studentId) {
        User mentor = getUser(ud);
        boolean assigned = userRepo.findByMentorEmail(mentor.getEmail()).stream().anyMatch(s -> s.getId().equals(studentId));
        if (!assigned && mentor.getRole() != User.Role.ADMIN) {
            throw new org.springframework.security.access.AccessDeniedException("Student is not assigned to this mentor");
        }
        return ResponseEntity.ok(ApiResponse.ok(supervisionService.getStudentActivity(studentId)));
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
