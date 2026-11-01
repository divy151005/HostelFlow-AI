package com.hostelflow.controller;

import com.hostelflow.dto.response.ApiResponse;
import com.hostelflow.model.FeeRecord;
import com.hostelflow.model.NoDuesRequest;
import com.hostelflow.model.User;
import com.hostelflow.repository.UserRepository;
import com.hostelflow.service.FinanceService;
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
@RequestMapping("/api/finance")
@RequiredArgsConstructor
public class FinanceController {

    private final FinanceService financeService;
    private final UserRepository userRepo;

    private User getUser(UserDetails ud) {
        return userRepo.findByEmail(ud.getUsername()).orElseThrow();
    }

    // ── Student Dues & Fines ──
    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('STUDENT', 'PARENT')")
    public ResponseEntity<ApiResponse<List<FeeRecord>>> getMyFees(
            @AuthenticationPrincipal UserDetails ud) {
        User user = getUser(ud);
        String studentId = user.getId();
        if (user.getRole() == User.Role.PARENT && user.getLinkedStudentId() != null) {
            studentId = user.getLinkedStudentId();
        }
        return ResponseEntity.ok(ApiResponse.ok(financeService.getStudentFees(studentId)));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('WARDEN', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<FeeRecord>>> getAllFees() {
        return ResponseEntity.ok(ApiResponse.ok(financeService.getAllFees()));
    }

    @PostMapping("/pay/{feeId}")
    public ResponseEntity<ApiResponse<FeeRecord>> payFee(
            @PathVariable String feeId,
            @RequestBody(required = false) Map<String, String> body) {
        String ref = body != null ? body.get("paymentRef") : "SIMULATED_UPI_" + System.currentTimeMillis();
        return ResponseEntity.ok(ApiResponse.ok("Payment successful! Receipt generated.",
                financeService.payFee(feeId, ref)));
    }

    @PostMapping("/issue-fine")
    @PreAuthorize("hasAnyRole('WARDEN', 'ADMIN')")
    public ResponseEntity<ApiResponse<FeeRecord>> issueFine(
            @RequestBody Map<String, Object> body) {
        String studentId = (String) body.get("studentId");
        String title = (String) body.get("title");
        String type = (String) body.getOrDefault("type", "FINE");
        double amount = Double.parseDouble(body.get("amount").toString());
        String remarks = (String) body.getOrDefault("remarks", "");
        LocalDate dueDate = body.containsKey("dueDate") ? LocalDate.parse((String) body.get("dueDate")) : null;

        return ResponseEntity.ok(ApiResponse.ok("Fine/Due issued",
                financeService.issueFine(studentId, title, type, amount, remarks, dueDate)));
    }

    // ── Digital No-Dues Clearance ──
    @PostMapping("/nodues/apply")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<NoDuesRequest>> applyNoDues(
            @AuthenticationPrincipal UserDetails ud,
            @RequestBody Map<String, String> body) {
        User student = getUser(ud);
        String reason = body.getOrDefault("reason", "Graduation / Vacating Hostel");
        return ResponseEntity.ok(ApiResponse.ok("No-Dues application initiated",
                financeService.applyNoDues(student.getId(), reason)));
    }

    @GetMapping("/nodues/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<NoDuesRequest>> getMyNoDues(
            @AuthenticationPrincipal UserDetails ud) {
        User student = getUser(ud);
        return ResponseEntity.ok(ApiResponse.ok(financeService.getStudentNoDues(student.getId()).orElse(null)));
    }

    @GetMapping("/nodues/all")
    @PreAuthorize("hasAnyRole('WARDEN', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<NoDuesRequest>>> getAllNoDues() {
        return ResponseEntity.ok(ApiResponse.ok(financeService.getAllNoDues()));
    }

    @PostMapping("/nodues/{requestId}/signoff")
    @PreAuthorize("hasAnyRole('WARDEN', 'ADMIN')")
    public ResponseEntity<ApiResponse<NoDuesRequest>> signoffDepartment(
            @PathVariable String requestId,
            @RequestBody Map<String, Object> body) {
        String department = (String) body.get("department");
        boolean cleared = Boolean.parseBoolean(body.getOrDefault("cleared", "true").toString());
        String remarks = (String) body.getOrDefault("remarks", "Approved without liability");
        return ResponseEntity.ok(ApiResponse.ok("Department clearance recorded",
                financeService.signoffDepartment(requestId, department, cleared, remarks)));
    }
}
