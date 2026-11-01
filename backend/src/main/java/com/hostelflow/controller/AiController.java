package com.hostelflow.controller;

import com.hostelflow.dto.response.ApiResponse;
import com.hostelflow.model.User;
import com.hostelflow.repository.UserRepository;
import com.hostelflow.service.AiRiskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiRiskService aiService;
    private final UserRepository userRepo;

    @PostMapping("/assistant")
    public ResponseEntity<ApiResponse<Map<String, Object>>> chatAssistant(
            @AuthenticationPrincipal UserDetails ud,
            @RequestBody Map<String, String> body) {
        String role = "STUDENT";
        if (ud != null) {
            User u = userRepo.findByEmail(ud.getUsername()).orElse(null);
            if (u != null) role = u.getRole().name();
        }
        String query = body.getOrDefault("query", "");
        return ResponseEntity.ok(ApiResponse.ok(aiService.askAssistant(role, query)));
    }

    @PostMapping("/triage")
    public ResponseEntity<ApiResponse<Map<String, Object>>> autoTriageComplaint(
            @RequestBody Map<String, String> body) {
        String title = body.getOrDefault("title", "");
        String description = body.getOrDefault("description", "");
        return ResponseEntity.ok(ApiResponse.ok(aiService.autoTriageComplaint(title, description)));
    }
}
