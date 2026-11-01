package com.hostelflow.controller;

import com.hostelflow.dto.response.ApiResponse;
import com.hostelflow.model.LaundryBooking;
import com.hostelflow.model.LostAndFoundItem;
import com.hostelflow.model.User;
import com.hostelflow.repository.UserRepository;
import com.hostelflow.service.CommunityService;
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
@RequestMapping("/api/community")
@RequiredArgsConstructor
public class CommunityController {

    private final CommunityService communityService;
    private final UserRepository userRepo;

    private User getUser(UserDetails ud) {
        return userRepo.findByEmail(ud.getUsername()).orElseThrow();
    }

    // ── Laundry Slot Booking ──
    @PostMapping("/laundry/book")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<LaundryBooking>> bookLaundry(
            @AuthenticationPrincipal UserDetails ud,
            @RequestBody Map<String, String> body) {
        User student = getUser(ud);
        String machine = body.getOrDefault("machineNumber", "Machine 1");
        LocalDate date = body.containsKey("date") ? LocalDate.parse(body.get("date")) : LocalDate.now();
        String timeSlot = body.get("timeSlot");
        return ResponseEntity.ok(ApiResponse.ok("Laundry slot reserved",
                communityService.bookLaundrySlot(student.getId(), machine, date, timeSlot)));
    }

    @GetMapping("/laundry/slots")
    public ResponseEntity<ApiResponse<List<LaundryBooking>>> getLaundrySlots(
            @RequestParam(required = false) String date) {
        LocalDate d = date != null ? LocalDate.parse(date) : LocalDate.now();
        return ResponseEntity.ok(ApiResponse.ok(communityService.getLaundryBookings(d)));
    }

    @GetMapping("/laundry/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<LaundryBooking>>> getMyLaundry(
            @AuthenticationPrincipal UserDetails ud) {
        User student = getUser(ud);
        return ResponseEntity.ok(ApiResponse.ok(communityService.getStudentLaundry(student.getId())));
    }

    @DeleteMapping("/laundry/{id}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<LaundryBooking>> cancelLaundry(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable String id) {
        User student = getUser(ud);
        return ResponseEntity.ok(ApiResponse.ok("Booking cancelled",
                communityService.cancelLaundry(id, student.getId())));
    }

    // ── Lost & Found ──
    @PostMapping("/lost-found")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<LostAndFoundItem>> postLostFound(
            @AuthenticationPrincipal UserDetails ud,
            @RequestBody LostAndFoundItem item) {
        User student = getUser(ud);
        return ResponseEntity.ok(ApiResponse.ok("Item posted to bulletin",
                communityService.postLostAndFound(student.getId(), item)));
    }

    @GetMapping("/lost-found")
    public ResponseEntity<ApiResponse<List<LostAndFoundItem>>> getLostFound() {
        return ResponseEntity.ok(ApiResponse.ok(communityService.getLostAndFound()));
    }

    @PostMapping("/lost-found/{id}/claim")
    public ResponseEntity<ApiResponse<LostAndFoundItem>> claimItem(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok("Item marked as claimed",
                communityService.claimItem(id)));
    }
}
