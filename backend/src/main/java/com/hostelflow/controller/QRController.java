package com.hostelflow.controller;

import com.hostelflow.dto.request.LeaveDTOs.*;
import com.hostelflow.dto.response.ApiResponse;
import com.hostelflow.model.LeaveRequest;
import com.hostelflow.service.LeaveService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/qr")
@RequiredArgsConstructor
public class QRController {

    private final LeaveService leaveService;

    @PostMapping("/scan")
    public ResponseEntity<ApiResponse<LeaveRequest>> scan(@Valid @RequestBody QRScanRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("QR scanned", leaveService.processQRScan(req)));
    }

    // GET endpoint for direct QR link verification (used in QR image URL)
    @GetMapping("/verify")
    public ResponseEntity<ApiResponse<LeaveRequest>> verify(@RequestParam String token) {
        QRScanRequest req = new QRScanRequest();
        req.setQrToken(token);
        req.setScanType("OUT");
        return ResponseEntity.ok(ApiResponse.ok("QR verified", leaveService.processQRScan(req)));
    }
}
