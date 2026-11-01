package com.hostelflow.controller;

import com.hostelflow.dto.response.ApiResponse;
import com.hostelflow.model.User;
import com.hostelflow.model.VisitorPass;
import com.hostelflow.repository.UserRepository;
import com.hostelflow.service.VisitorPassService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/visitor")
@RequiredArgsConstructor
public class VisitorController {

    private final VisitorPassService visitorService;
    private final UserRepository userRepo;

    private User getUser(UserDetails ud) {
        return userRepo.findByEmail(ud.getUsername()).orElseThrow();
    }

    @PostMapping("/apply")
    @PreAuthorize("hasAnyRole('STUDENT', 'PARENT')")
    public ResponseEntity<ApiResponse<VisitorPass>> applyVisitor(
            @AuthenticationPrincipal UserDetails ud,
            @RequestBody VisitorPass pass) {
        User user = getUser(ud);
        String studentId = user.getId();
        if (user.getRole() == User.Role.PARENT && user.getLinkedStudentId() != null) {
            studentId = user.getLinkedStudentId();
        }
        return ResponseEntity.ok(ApiResponse.ok("Visitor pass application submitted",
                visitorService.applyVisitorPass(studentId, pass)));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('STUDENT', 'PARENT')")
    public ResponseEntity<ApiResponse<List<VisitorPass>>> getMyPasses(
            @AuthenticationPrincipal UserDetails ud) {
        User user = getUser(ud);
        String studentId = user.getId();
        if (user.getRole() == User.Role.PARENT && user.getLinkedStudentId() != null) {
            studentId = user.getLinkedStudentId();
        }
        return ResponseEntity.ok(ApiResponse.ok(visitorService.getStudentVisitorPasses(studentId)));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<VisitorPass>>> getAllPasses() {
        return ResponseEntity.ok(ApiResponse.ok(visitorService.getAllVisitorPasses()));
    }

    @PostMapping("/{passId}/approve")
    @PreAuthorize("hasAnyRole('WARDEN', 'ADMIN')")
    public ResponseEntity<ApiResponse<VisitorPass>> approvePass(
            @PathVariable String passId,
            @RequestBody Map<String, Object> body) {
        boolean approved = Boolean.parseBoolean(body.getOrDefault("approved", "true").toString());
        String remarks = (String) body.getOrDefault("remarks", "");
        return ResponseEntity.ok(ApiResponse.ok("Pass status updated",
                visitorService.approveVisitorPass(passId, approved, remarks)));
    }

    @PostMapping("/gate-action")
    public ResponseEntity<ApiResponse<VisitorPass>> processGateAction(
            @RequestBody Map<String, String> body) {
        String code = body.get("code");
        String action = body.getOrDefault("action", "ENTRY");
        return ResponseEntity.ok(ApiResponse.ok("Visitor gate action recorded",
                visitorService.processGateAction(code, action)));
    }
}
