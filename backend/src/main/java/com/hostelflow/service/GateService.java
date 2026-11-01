package com.hostelflow.service;

import com.hostelflow.dto.request.LeaveDTOs.QRScanRequest;
import com.hostelflow.model.LeaveRequest;
import com.hostelflow.model.Notification;
import com.hostelflow.model.User;
import com.hostelflow.repository.LeaveRequestRepository;
import com.hostelflow.repository.UserRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GateService {

    private final UserRepository userRepo;
    private final LeaveRequestRepository leaveRepo;
    private final LeaveService leaveService;
    private final NotificationService notificationService;

    @Data
    @Builder
    public static class GateStudentProfile {
        private String studentId;
        private String fullName;
        private String rollNumber;
        private String roomNumber;
        private String hostelBlock;
        private String phone;
        private String parentPhone;
        private String riskLevel;
        private boolean isOutside;
        private boolean isOverdue;
        private LeaveRequest activeLeave;
        private List<LeaveRequest> recentHistory;
    }

    public GateStudentProfile lookup(String query) {
        if (query == null || query.trim().isEmpty()) {
            throw new RuntimeException("Search query cannot be empty");
        }
        String cleanQuery = query.trim();

        // Check if query is a QR token
        Optional<LeaveRequest> leaveByToken = leaveRepo.findByQrToken(cleanQuery);
        User student = null;
        if (leaveByToken.isPresent()) {
            student = userRepo.findById(leaveByToken.get().getStudentId()).orElse(null);
        }

        // If not found by token, search by rollNumber or email
        if (student == null) {
            student = userRepo.findByRollNumber(cleanQuery)
                    .or(() -> userRepo.findByEmail(cleanQuery))
                    .orElseThrow(() -> new RuntimeException("Student not found for identifier: " + cleanQuery));
        }

        List<LeaveRequest> leaves = leaveRepo.findByStudentIdOrderByCreatedAtDesc(student.getId());
        LeaveRequest activeLeave = leaves.stream()
                .filter(l -> l.getStatus() == LeaveRequest.Status.APPROVED || 
                             l.getStatus() == LeaveRequest.Status.LATE ||
                             (l.isQrScannedOut() && !l.isQrScannedIn()))
                .findFirst().orElse(null);

        boolean isOutside = activeLeave != null && activeLeave.isQrScannedOut() && !activeLeave.isQrScannedIn();
        boolean isOverdue = false;
        if (isOutside && activeLeave != null && activeLeave.getExpectedReturn() != null) {
            isOverdue = LocalDateTime.now().isAfter(activeLeave.getExpectedReturn());
        }

        return GateStudentProfile.builder()
                .studentId(student.getId())
                .fullName(student.getFullName())
                .rollNumber(student.getRollNumber())
                .roomNumber(student.getRoomNumber())
                .hostelBlock(student.getHostelBlock())
                .phone(student.getPhone())
                .parentPhone(student.getParentPhone())
                .riskLevel(student.getRiskLevel() != null ? student.getRiskLevel().name() : "LOW")
                .isOutside(isOutside)
                .isOverdue(isOverdue)
                .activeLeave(activeLeave)
                .recentHistory(leaves.stream().limit(5).collect(Collectors.toList()))
                .build();
    }

    public LeaveRequest markGateAction(String qrToken, String rollNumber, String scanType) {
        LeaveRequest leave = null;
        if (qrToken != null && !qrToken.isBlank()) {
            leave = leaveRepo.findByQrToken(qrToken).orElse(null);
        }
        if (leave == null && rollNumber != null && !rollNumber.isBlank()) {
            User s = userRepo.findByRollNumber(rollNumber)
                    .orElseThrow(() -> new RuntimeException("Student not found with roll: " + rollNumber));
            List<LeaveRequest> list = leaveRepo.findByStudentIdOrderByCreatedAtDesc(s.getId());
            leave = list.stream()
                    .filter(l -> l.getStatus() == LeaveRequest.Status.APPROVED || 
                                 l.getStatus() == LeaveRequest.Status.LATE ||
                                 (l.isQrScannedOut() && !l.isQrScannedIn()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("No active approved leave pass found for " + s.getFullName()));
        }

        if (leave == null) {
            throw new RuntimeException("No valid gate pass found for this scan");
        }

        QRScanRequest req = new QRScanRequest();
        req.setQrToken(leave.getQrToken());
        req.setScanType(scanType != null ? scanType : (leave.isQrScannedOut() ? "IN" : "OUT"));

        return leaveService.processQRScan(req);
    }

    public List<Map<String, Object>> getRecentGateLogs() {
        List<LeaveRequest> all = leaveRepo.findAll();
        List<LeaveRequest> scanned = all.stream()
                .filter(l -> l.getScannedOutAt() != null || l.getActualReturn() != null)
                .sorted((a, b) -> {
                    LocalDateTime ta = a.getActualReturn() != null ? a.getActualReturn() : a.getScannedOutAt();
                    LocalDateTime tb = b.getActualReturn() != null ? b.getActualReturn() : b.getScannedOutAt();
                    if (ta == null && tb == null) return 0;
                    if (ta == null) return 1;
                    if (tb == null) return -1;
                    return tb.compareTo(ta);
                })
                .limit(20)
                .collect(Collectors.toList());

        List<Map<String, Object>> logs = new ArrayList<>();
        for (LeaveRequest l : scanned) {
            User s = userRepo.findById(l.getStudentId()).orElse(null);
            Map<String, Object> map = new HashMap<>();
            map.put("leaveId", l.getId());
            map.put("studentName", s != null ? s.getFullName() : "Student");
            map.put("rollNumber", s != null ? s.getRollNumber() : "");
            map.put("roomNumber", s != null ? s.getRoomNumber() : "");
            map.put("type", l.getType() != null ? l.getType().name() : "OUTING");
            map.put("scannedOutAt", l.getScannedOutAt());
            map.put("actualReturn", l.getActualReturn());
            map.put("expectedReturn", l.getExpectedReturn());
            map.put("isLate", l.isLate());
            map.put("status", l.isQrScannedIn() ? "RETURNED" : (l.isQrScannedOut() ? "EXITED" : l.getStatus().name()));
            logs.add(map);
        }
        return logs;
    }
}
