package com.hostelflow.controller;

import com.hostelflow.dto.response.ApiResponse;
import com.hostelflow.model.*;
import com.hostelflow.repository.UserRepository;
import com.hostelflow.service.MessExtensionService;
import com.hostelflow.service.MessService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mess")
@RequiredArgsConstructor
public class MessController {

    private final MessService messService;
    private final MessExtensionService messExtService;
    private final UserRepository userRepo;

    private User getUser(UserDetails ud) {
        return userRepo.findByEmail(ud.getUsername()).orElseThrow();
    }

    @GetMapping("/timetable")
    public ResponseEntity<ApiResponse<List<MessTimetable>>> getTimetable() {
        return ResponseEntity.ok(ApiResponse.ok(messService.getWeeklyTimetable()));
    }

    @PutMapping("/timetable/{dayOfWeek}")
    @PreAuthorize("hasAnyRole('WARDEN', 'ADMIN')")
    public ResponseEntity<ApiResponse<MessTimetable>> updateTimetable(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable String dayOfWeek,
            @RequestBody MessTimetable input) {
        User user = getUser(ud);
        return ResponseEntity.ok(ApiResponse.ok("Menu updated",
                messService.updateDayTimetable(dayOfWeek, input, user.getFullName())));
    }

    @PostMapping("/feedback")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<FoodFeedback>> submitFeedback(
            @AuthenticationPrincipal UserDetails ud,
            @RequestBody FoodFeedback input) {
        User student = getUser(ud);
        return ResponseEntity.ok(ApiResponse.ok("Food feedback submitted",
                messService.submitFeedback(student, input)));
    }

    @GetMapping("/feedback/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<FoodFeedback>>> getMyFeedback(
            @AuthenticationPrincipal UserDetails ud) {
        User student = getUser(ud);
        return ResponseEntity.ok(ApiResponse.ok(messService.getStudentFeedback(student.getId())));
    }

    @GetMapping("/feedback")
    @PreAuthorize("hasAnyRole('WARDEN', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<FoodFeedback>>> getAllFeedback() {
        return ResponseEntity.ok(ApiResponse.ok(messService.getAllFeedback()));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('WARDEN', 'ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFeedbackStats() {
        return ResponseEntity.ok(ApiResponse.ok(messService.getFeedbackStats()));
    }

    // ── Smart Food-Waste: Skip-a-Meal & Rebate ──
    @PostMapping("/opt-out")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<MealOptOut>> optOutMeal(
            @AuthenticationPrincipal UserDetails ud,
            @RequestBody Map<String, String> body) {
        User student = getUser(ud);
        LocalDate date = body.containsKey("date") ? LocalDate.parse(body.get("date")) : LocalDate.now();
        String mealType = body.getOrDefault("mealType", "DINNER");
        String reason = body.getOrDefault("reason", "Outing / Eating outside");
        return ResponseEntity.ok(ApiResponse.ok("Meal opted out. ₹50 mess rebate credited!",
                messExtService.optOutMeal(student.getId(), date, mealType, reason)));
    }

    @GetMapping("/opt-outs/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyOptOuts(
            @AuthenticationPrincipal UserDetails ud) {
        User student = getUser(ud);
        List<MealOptOut> list = messExtService.getStudentOptOuts(student.getId());
        double rebate = messExtService.getTotalRebate(student.getId());
        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "optOuts", list,
                "totalRebate", rebate
        )));
    }

    @GetMapping("/kitchen-headcount")
    public ResponseEntity<ApiResponse<MessExtensionService.KitchenHeadcountSummary>> getKitchenHeadcount(
            @RequestParam(required = false) String date) {
        LocalDate targetDate = date != null ? LocalDate.parse(date) : LocalDate.now();
        return ResponseEntity.ok(ApiResponse.ok(messExtService.getKitchenHeadcount(targetDate)));
    }

    // ── Sunday / Special Menu Polling ──
    @GetMapping("/polls")
    public ResponseEntity<ApiResponse<List<MealPoll>>> getActivePolls() {
        return ResponseEntity.ok(ApiResponse.ok(messExtService.getActivePolls()));
    }

    @PostMapping("/polls")
    @PreAuthorize("hasAnyRole('WARDEN', 'ADMIN')")
    public ResponseEntity<ApiResponse<MealPoll>> createPoll(@RequestBody MealPoll poll) {
        return ResponseEntity.ok(ApiResponse.ok("Poll created", messExtService.createPoll(poll)));
    }

    @PostMapping("/polls/{pollId}/vote")
    public ResponseEntity<ApiResponse<MealPoll>> votePoll(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable String pollId,
            @RequestBody Map<String, String> body) {
        User student = getUser(ud);
        String option = body.get("option");
        return ResponseEntity.ok(ApiResponse.ok("Vote cast successfully",
                messExtService.votePoll(pollId, student.getId(), option)));
    }
}
