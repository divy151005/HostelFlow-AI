package com.hostelflow.service;

import com.hostelflow.model.User;
import com.hostelflow.repository.LeaveRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiRiskService {

    private final WebClient.Builder webClientBuilder;
    private final LeaveRequestRepository leaveRepo;

    @Value("${app.ai.service.url}")
    private String aiServiceUrl;

    public User.RiskLevel assessRisk(String studentId, int lateCount) {
        // Try Python AI service first, fallback to rule-based
        try {
            long totalLeaves = leaveRepo.countByStudentIdAndIsLate(studentId, false);
            long lateReturns = leaveRepo.countByStudentIdAndIsLate(studentId, true);

            Map<String, Object> payload = Map.of(
                "student_id", studentId,
                "late_count", lateCount,
                "total_leaves", totalLeaves,
                "late_returns", lateReturns
            );

            Map response = webClientBuilder.build()
                    .post()
                    .uri(aiServiceUrl + "/predict/risk")
                    .bodyValue(payload)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response != null && response.containsKey("risk_level")) {
                return User.RiskLevel.valueOf(response.get("risk_level").toString().toUpperCase());
            }
        } catch (Exception e) {
            log.warn("AI service unavailable, using rule-based risk: {}", e.getMessage());
        }

        // Rule-based fallback
        return ruleBasedRisk(lateCount);
    }

    private User.RiskLevel ruleBasedRisk(int lateCount) {
        if (lateCount >= 5) return User.RiskLevel.HIGH;
        if (lateCount >= 3) return User.RiskLevel.MEDIUM;
        return User.RiskLevel.LOW;
    }
}
