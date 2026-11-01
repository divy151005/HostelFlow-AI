package com.hostelflow.controller;

import com.hostelflow.dto.response.ApiResponse;
import com.hostelflow.model.*;
import com.hostelflow.repository.*;
import com.hostelflow.service.AnalyticsService;
import com.hostelflow.service.SupervisionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepo;
    private final LeaveRequestRepository leaveRepo;
    private final HostelComplaintRepository complaintRepo;
    private final MaintenanceTaskRepository maintenanceRepo;
    private final StudentIncidentRepository incidentRepo;
    private final HostelFeedbackRepository feedbackRepo;
    private final FoodFeedbackRepository foodFeedbackRepo;
    private final AnalyticsService analyticsService;
    private final SupervisionService supervisionService;
    private final PasswordEncoder passwordEncoder;

    // ── Overview ──

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOverview() {
        Map<String, Object> supervision = supervisionService.getWardenSupervisionOverview();
        long totalUsers = userRepo.count();
        long totalStudents = userRepo.countByRole(User.Role.STUDENT);
        long totalWardens = userRepo.countByRole(User.Role.WARDEN);
        long totalMentors = userRepo.countByRole(User.Role.MENTOR);
        long totalParents = userRepo.countByRole(User.Role.PARENT);
        long pendingLeaves = leaveRepo.countByStatus(LeaveRequest.Status.PENDING_WARDEN)
                + leaveRepo.countByStatus(LeaveRequest.Status.PENDING_MENTOR)
                + leaveRepo.countByStatus(LeaveRequest.Status.PENDING_PARENT);

        long openComplaints = complaintRepo.countByStatus("SUBMITTED")
                + complaintRepo.countByStatus("ASSIGNED")
                + complaintRepo.countByStatus("IN_PROGRESS")
                + complaintRepo.countByStatus("REOPENED");

        long pendingMaintenance = maintenanceRepo.countByStatus("PENDING")
                + maintenanceRepo.countByStatus("ASSIGNED")
                + maintenanceRepo.countByStatus("IN_PROGRESS");

        Map<String, Object> overview = new HashMap<>(supervision);
        overview.put("totalUsers", totalUsers);
        overview.put("totalStudents", totalStudents);
        overview.put("totalWardens", totalWardens);
        overview.put("totalMentors", totalMentors);
        overview.put("totalParents", totalParents);
        overview.put("pendingLeaves", pendingLeaves);
        overview.put("openComplaints", openComplaints);
        overview.put("pendingMaintenance", pendingMaintenance);
        overview.put("totalIncidents", incidentRepo.count());

        return ResponseEntity.ok(ApiResponse.ok(overview));
    }

    // ── User Management ──

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers(@RequestParam(required = false) String role) {
        if (role != null && !role.isBlank()) {
            return ResponseEntity.ok(ApiResponse.ok(userRepo.findByRole(User.Role.valueOf(role.toUpperCase()))));
        }
        return ResponseEntity.ok(ApiResponse.ok(userRepo.findAll()));
    }

    @PostMapping("/users")
    public ResponseEntity<ApiResponse<User>> createUser(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) throw new IllegalArgumentException("Email is required");
        if (userRepo.existsByEmail(email)) throw new IllegalArgumentException("User with this email already exists");

        String rawPassword = body.getOrDefault("password", "password");
        String roleStr = body.getOrDefault("role", "STUDENT").toUpperCase();
        User.Role role = User.Role.valueOf(roleStr);

        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(rawPassword))
                .fullName(body.getOrDefault("fullName", "User"))
                .phone(body.get("phone"))
                .role(role)
                .rollNumber(body.get("rollNumber"))
                .roomNumber(body.get("roomNumber"))
                .hostelBlock(body.getOrDefault("hostelBlock", "A"))
                .course(body.get("course"))
                .year(body.get("year"))
                .parentEmail(body.get("parentEmail"))
                .parentPhone(body.get("parentPhone"))
                .mentorEmail(body.get("mentorEmail"))
                .linkedStudentId(body.get("linkedStudentId"))
                .wardenId(body.get("wardenId"))
                .assignedBlock(body.get("assignedBlock"))
                .riskLevel(User.RiskLevel.LOW)
                .lateReturnCount(0)
                .enabled(true)
                .accountNonLocked(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return ResponseEntity.ok(ApiResponse.ok("User created", userRepo.save(user)));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<User>> updateUser(@PathVariable String id, @RequestBody Map<String, String> body) {
        User user = userRepo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));

        if (body.containsKey("fullName")) user.setFullName(body.get("fullName"));
        if (body.containsKey("phone")) user.setPhone(body.get("phone"));
        if (body.containsKey("rollNumber")) user.setRollNumber(body.get("rollNumber"));
        if (body.containsKey("roomNumber")) user.setRoomNumber(body.get("roomNumber"));
        if (body.containsKey("hostelBlock")) user.setHostelBlock(body.get("hostelBlock"));
        if (body.containsKey("course")) user.setCourse(body.get("course"));
        if (body.containsKey("year")) user.setYear(body.get("year"));
        if (body.containsKey("parentEmail")) user.setParentEmail(body.get("parentEmail"));
        if (body.containsKey("mentorEmail")) user.setMentorEmail(body.get("mentorEmail"));
        if (body.containsKey("linkedStudentId")) user.setLinkedStudentId(body.get("linkedStudentId"));
        if (body.containsKey("wardenId")) user.setWardenId(body.get("wardenId"));
        if (body.containsKey("assignedBlock")) user.setAssignedBlock(body.get("assignedBlock"));
        if (body.containsKey("role")) user.setRole(User.Role.valueOf(body.get("role").toUpperCase()));
        if (body.containsKey("password") && !body.get("password").isBlank()) {
            user.setPassword(passwordEncoder.encode(body.get("password")));
        }
        user.setUpdatedAt(LocalDateTime.now());

        return ResponseEntity.ok(ApiResponse.ok("User updated", userRepo.save(user)));
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

    // ── Performance Analytics ──

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAnalytics() {
        Map<String, Object> analytics = new HashMap<>();

        List<HostelComplaint> allComplaints = complaintRepo.findAll();
        long resolved = allComplaints.stream().filter(c -> "RESOLVED".equalsIgnoreCase(c.getStatus())).count();
        double resolutionRate = allComplaints.isEmpty() ? 100.0 : Math.round((double) resolved / allComplaints.size() * 1000.0) / 10.0;

        List<MaintenanceTask> allTasks = maintenanceRepo.findAll();
        long completedTasks = allTasks.stream().filter(t -> "COMPLETED".equalsIgnoreCase(t.getStatus())).count();
        double maintenanceCompletionRate = allTasks.isEmpty() ? 100.0 : Math.round((double) completedTasks / allTasks.size() * 1000.0) / 10.0;

        List<FoodFeedback> foodFb = foodFeedbackRepo.findAll();
        double avgFood = foodFb.stream().mapToInt(FoodFeedback::getFoodQualityRating).average().orElse(0.0);
        double avgHygiene = foodFb.stream().mapToInt(FoodFeedback::getHygieneRating).average().orElse(0.0);

        List<User> students = userRepo.findByRole(User.Role.STUDENT);
        long highRiskCount = students.stream().filter(s -> s.getRiskLevel() == User.RiskLevel.HIGH).count();
        long medRiskCount = students.stream().filter(s -> s.getRiskLevel() == User.RiskLevel.MEDIUM).count();

        analytics.put("totalComplaints", allComplaints.size());
        analytics.put("resolvedComplaints", resolved);
        analytics.put("complaintResolutionRate", resolutionRate);
        analytics.put("totalMaintenanceTasks", allTasks.size());
        analytics.put("completedMaintenanceTasks", completedTasks);
        analytics.put("maintenanceCompletionRate", maintenanceCompletionRate);
        analytics.put("avgFoodQuality", Math.round(avgFood * 10.0) / 10.0);
        analytics.put("avgFoodHygiene", Math.round(avgHygiene * 10.0) / 10.0);
        analytics.put("highRiskStudents", highRiskCount);
        analytics.put("mediumRiskStudents", medRiskCount);
        analytics.put("totalStudents", students.size());

        return ResponseEntity.ok(ApiResponse.ok(analytics));
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
