package com.hostelflow.controller;

import com.hostelflow.dto.response.ApiResponse;
import com.hostelflow.model.LeaveRequest;
import com.hostelflow.service.GateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/gate")
@RequiredArgsConstructor
public class GateController {

    private final GateService gateService;

    @GetMapping("/lookup")
    public ResponseEntity<ApiResponse<GateService.GateStudentProfile>> lookup(@RequestParam String query) {
        return ResponseEntity.ok(ApiResponse.ok("Student lookup successful", gateService.lookup(query)));
    }

    @PostMapping("/scan")
    public ResponseEntity<ApiResponse<LeaveRequest>> markGateAction(@RequestBody Map<String, String> body) {
        String qrToken = body.get("qrToken");
        String rollNumber = body.get("rollNumber");
        String scanType = body.get("scanType"); // "OUT" or "IN"
        return ResponseEntity.ok(ApiResponse.ok("Gate scan processed", gateService.markGateAction(qrToken, rollNumber, scanType)));
    }

    @GetMapping("/logs")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getRecentGateLogs() {
        return ResponseEntity.ok(ApiResponse.ok("Gate activity logs", gateService.getRecentGateLogs()));
    }
}
