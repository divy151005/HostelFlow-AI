package com.hostelflow.controller;

import com.hostelflow.dto.response.ApiResponse;
import com.hostelflow.model.Announcement;
import com.hostelflow.model.User;
import com.hostelflow.repository.AnnouncementRepository;
import com.hostelflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementRepository announcementRepo;
    private final UserRepository userRepo;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Announcement>>> getAnnouncements() {
        return ResponseEntity.ok(ApiResponse.ok(announcementRepo.findAllByOrderByCreatedAtDesc()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('WARDEN', 'ADMIN')")
    public ResponseEntity<ApiResponse<Announcement>> createAnnouncement(
            @AuthenticationPrincipal UserDetails ud,
            @RequestBody Announcement input) {
        User user = userRepo.findByEmail(ud.getUsername()).orElseThrow();
        input.setAuthorName(user.getFullName());
        input.setAuthorRole(user.getRole().name());
        input.setCreatedAt(LocalDateTime.now());
        if (input.getTargetRoles() == null || input.getTargetRoles().isEmpty()) {
            input.setTargetRoles(List.of("ALL"));
        }
        return ResponseEntity.ok(ApiResponse.ok("Announcement published", announcementRepo.save(input)));
    }
}
