package com.hostelflow.service;

import com.hostelflow.model.*;
import com.hostelflow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final LeaveRequestRepository leaveRepo;
    private final UserRepository userRepo;

    public Map<String, Object> getWardenDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        List<LeaveRequest> allLeaves = leaveRepo.findAll();
        List<User> allStudents = userRepo.findByRole(User.Role.STUDENT);

        // Current status
        long currentlyOut = leaveRepo.findCurrentlyOut().size();
        long pendingApproval = leaveRepo.findByStatus(LeaveRequest.Status.PENDING_WARDEN).size()
                + leaveRepo.findByStatus(LeaveRequest.Status.PENDING_MENTOR).size()
                + leaveRepo.findByStatus(LeaveRequest.Status.PENDING_PARENT).size();
        long totalLate = allLeaves.stream().filter(LeaveRequest::isLate).count();
        long highRisk = allStudents.stream()
                .filter(s -> s.getRiskLevel() == User.RiskLevel.HIGH).count();

        stats.put("currentlyOut", currentlyOut);
        stats.put("pendingApproval", pendingApproval);
        stats.put("totalLateReturns", totalLate);
        stats.put("highRiskStudents", highRisk);
        stats.put("totalStudents", allStudents.size());

        // Leave type breakdown
        Map<String, Long> byType = allLeaves.stream()
                .collect(Collectors.groupingBy(
                        l -> l.getType().name(),
                        Collectors.counting()
                ));
        stats.put("leavesByType", byType);

        // Status breakdown
        Map<String, Long> byStatus = allLeaves.stream()
                .collect(Collectors.groupingBy(
                        l -> l.getStatus().name(),
                        Collectors.counting()
                ));
        stats.put("leavesByStatus", byStatus);

        // Weekly trend (last 7 days)
        List<Map<String, Object>> weeklyTrend = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        for (int i = 6; i >= 0; i--) {
            LocalDateTime day = now.minusDays(i);
            LocalDateTime start = day.toLocalDate().atStartOfDay();
            LocalDateTime end = start.plusDays(1);
            List<LeaveRequest> dayLeaves = leaveRepo.findByDateRange(start, end);
            Map<String, Object> dayData = new HashMap<>();
            dayData.put("date", day.toLocalDate().toString());
            dayData.put("total", dayLeaves.size());
            dayData.put("approved", dayLeaves.stream()
                    .filter(l -> l.getStatus() == LeaveRequest.Status.APPROVED
                            || l.getStatus() == LeaveRequest.Status.COMPLETED).count());
            dayData.put("late", dayLeaves.stream().filter(LeaveRequest::isLate).count());
            weeklyTrend.add(dayData);
        }
        stats.put("weeklyTrend", weeklyTrend);

        // Risk level distribution
        Map<String, Long> riskDist = allStudents.stream()
                .collect(Collectors.groupingBy(
                        s -> s.getRiskLevel() != null ? s.getRiskLevel().name() : "LOW",
                        Collectors.counting()
                ));
        stats.put("riskDistribution", riskDist);

        return stats;
    }

    public List<User> getHighRiskStudents() {
        return userRepo.findStudentsByRiskLevel(User.RiskLevel.HIGH);
    }

    public List<User> getMediumRiskStudents() {
        return userRepo.findStudentsByRiskLevel(User.RiskLevel.MEDIUM);
    }
}
