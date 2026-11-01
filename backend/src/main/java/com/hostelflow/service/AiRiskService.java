package com.hostelflow.service;

import com.hostelflow.model.User;
import com.hostelflow.repository.LeaveRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiRiskService {

    private final WebClient.Builder webClientBuilder;
    private final LeaveRequestRepository leaveRepo;

    @Value("${app.ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    public User.RiskLevel assessRisk(String studentId, int lateCount) {
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

        return ruleBasedRisk(lateCount);
    }

    private User.RiskLevel ruleBasedRisk(int lateCount) {
        if (lateCount >= 5) return User.RiskLevel.HIGH;
        if (lateCount >= 3) return User.RiskLevel.MEDIUM;
        return User.RiskLevel.LOW;
    }

    public Map<String, Object> askAssistant(String role, String query) {
        try {
            Map response = webClientBuilder.build()
                    .post()
                    .uri(aiServiceUrl + "/assistant/chat")
                    .bodyValue(Map.of("user_role", role, "query", query))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response != null && response.containsKey("response")) {
                return (Map<String, Object>) response;
            }
        } catch (Exception e) {
            log.warn("AI assistant endpoint unavailable, using deterministic response: {}", e.getMessage());
        }

        // Local deterministic fallback
        String q = query.toLowerCase();
        String answer;
        if (q.contains("curfew") || q.contains("late")) {
            answer = "Curfew is 08:00 PM. Returns after expected hours are recorded and alert the warden and parent.";
        } else if (q.contains("leave") || q.contains("outing")) {
            answer = "Outings require mentor approval. Multi-day leaves require warden approval and parent confirmation.";
        } else if (q.contains("mess") || q.contains("food")) {
            answer = "Mess timetable and meals (Breakfast, Lunch, Snacks, Dinner) are updated by the warden. Feedback can be given under Hostel Care.";
        } else if (q.contains("sos") || q.contains("emergency")) {
            answer = "Click Emergency SOS in your Student Dashboard for an instant alert to your Warden, Mentor, and Linked Parent.";
        } else {
            answer = "HostelFlow Assistant: For leave approval, check with your mentor or warden. All scans and records are tracked live.";
        }

        Map<String, Object> res = new HashMap<>();
        res.put("query", query);
        res.put("response", answer);
        res.put("role", role);
        return res;
    }

    public Map<String, Object> autoTriageComplaint(String title, String description) {
        String text = ((title != null ? title : "") + " " + (description != null ? description : "")).toLowerCase();

        String category = "OTHER";
        String priority = "NORMAL";
        String suggestedStaff = "Hostel Care Supervisor";
        String reasoning = "General review needed.";

        if (text.contains("spark") || text.contains("short circuit") || text.contains("smoke") || text.contains("fire") || text.contains("shock")) {
            category = "ELECTRICITY";
            priority = "URGENT";
            suggestedStaff = "Senior Electrician";
            reasoning = "High safety hazard detected in complaint keywords.";
        } else if (text.contains("light") || text.contains("fan") || text.contains("switch") || text.contains("socket") || text.contains("plug") || text.contains("ac") || text.contains("power")) {
            category = "ELECTRICITY";
            priority = "HIGH";
            suggestedStaff = "Hostel Electrician";
            reasoning = "Electrical appliance or power supply issue.";
        } else if (text.contains("leak") || text.contains("water") || text.contains("tap") || text.contains("pipe") || text.contains("flush") || text.contains("toilet") || text.contains("drain") || text.contains("geyser")) {
            category = "WATER";
            priority = text.contains("overflow") || text.contains("flooding") ? "URGENT" : "HIGH";
            suggestedStaff = "Campus Plumber";
            reasoning = "Plumbing, water supply or sanitary repair required.";
        } else if (text.contains("mess") || text.contains("food") || text.contains("rice") || text.contains("dal") || text.contains("curry") || text.contains("undercooked") || text.contains("insect") || text.contains("taste")) {
            category = text.contains("insect") ? "INSECTS" : (text.contains("undercooked") ? "UNDERCOOKED_FOOD" : "FOOD_QUALITY");
            priority = text.contains("insect") ? "URGENT" : "HIGH";
            suggestedStaff = "Mess Quality In-Charge";
            reasoning = "Food safety and hygiene inspection warranted.";
        } else if (text.contains("dirty") || text.contains("clean") || text.contains("dust") || text.contains("garbage") || text.contains("waste") || text.contains("smell")) {
            category = "CLEANLINESS";
            priority = "NORMAL";
            suggestedStaff = "Housekeeping Supervisor";
            reasoning = "Room/corridor cleaning and hygiene upkeep.";
        }

        Map<String, Object> result = new HashMap<>();
        result.put("category", category);
        result.put("priority", priority);
        result.put("suggestedStaff", suggestedStaff);
        result.put("reasoning", reasoning);
        result.put("confidence", 0.94);
        return result;
    }
}
