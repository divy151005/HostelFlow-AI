package com.hostelflow.controller;

import com.hostelflow.dto.response.ApiResponse;
import com.hostelflow.model.User;
import com.hostelflow.repository.LeaveRequestRepository;
import com.hostelflow.repository.UserRepository;
import com.hostelflow.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepo;
    private final LeaveRequestRepository leaveRepo;
    private final AnalyticsService analyticsService;

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.ok(userRepo.findAll()));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable String id) {
        userRepo.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("User deleted", null));
    }

    @PatchMapping("/users/{id}/toggle-lock")
    public ResponseEntity<ApiResponse<User>> toggleLock(@PathVariable String id) {
        User user = userRepo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setAccountNonLocked(!user.isAccountNonLocked());
        return ResponseEntity.ok(ApiResponse.ok("Lock toggled", userRepo.save(user)));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getWardenDashboardStats()));
    }

    @DeleteMapping("/leaves/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteLeave(@PathVariable String id) {
        leaveRepo.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Leave deleted", null));
    }

    @GetMapping("/high-risk")
    public ResponseEntity<ApiResponse<List<User>>> getHighRisk() {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getHighRiskStudents()));
    }
}
