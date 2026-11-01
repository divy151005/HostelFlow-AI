package com.hostelflow.service;

import com.hostelflow.model.*;
import com.hostelflow.repository.FeeRecordRepository;
import com.hostelflow.repository.NoDuesRequestRepository;
import com.hostelflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class FinanceService {

    private final FeeRecordRepository feeRepo;
    private final NoDuesRequestRepository noDuesRepo;
    private final UserRepository userRepo;
    private final NotificationService notificationService;

    // ── Fee & Fine Ledger ──
    public List<FeeRecord> getStudentFees(String studentId) {
        return feeRepo.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    public List<FeeRecord> getAllFees() {
        return feeRepo.findAllByOrderByCreatedAtDesc();
    }

    public FeeRecord issueFine(String studentId, String title, String type, double amount, String remarks, LocalDate dueDate) {
        User student = userRepo.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        FeeRecord fee = FeeRecord.builder()
                .studentId(studentId)
                .studentName(student.getFullName())
                .rollNumber(student.getRollNumber())
                .roomNumber(student.getRoomNumber())
                .title(title)
                .type(type != null ? type : "FINE")
                .amount(amount)
                .status("UNPAID")
                .dueDate(dueDate != null ? dueDate : LocalDate.now().plusDays(7))
                .remarks(remarks)
                .createdAt(LocalDateTime.now())
                .build();

        FeeRecord saved = feeRepo.save(fee);

        notificationService.createNotification(
                studentId,
                Notification.NotificationType.FINE_ISSUED,
                "Notice of Dues / Fine Issued",
                title + " (₹" + amount + ") has been charged. Due by: " + fee.getDueDate(),
                saved.getId()
        );

        notificationService.notifyLinkedParent(
                studentId,
                Notification.NotificationType.FINE_ISSUED,
                "Student Dues / Fine Notice",
                "A charge of ₹" + amount + " (" + title + ") was recorded for " + student.getFullName(),
                saved.getId()
        );

        return saved;
    }

    public FeeRecord payFee(String feeId, String paymentRef) {
        FeeRecord fee = feeRepo.findById(feeId)
                .orElseThrow(() -> new RuntimeException("Fee record not found"));

        fee.setStatus("PAID");
        fee.setPaidAt(LocalDateTime.now());
        fee.setReceiptNumber("HF-REC-" + LocalDate.now().getYear() + "-" + (1000 + new Random().nextInt(9000)));
        if (paymentRef != null) {
            fee.setRemarks((fee.getRemarks() != null ? fee.getRemarks() + " | " : "") + "Ref: " + paymentRef);
        }

        return feeRepo.save(fee);
    }

    // ── No Dues Clearance ──
    public NoDuesRequest applyNoDues(String studentId, String reason) {
        if (noDuesRepo.findByStudentId(studentId).isPresent()) {
            return noDuesRepo.findByStudentId(studentId).get();
        }

        User student = userRepo.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        NoDuesRequest req = NoDuesRequest.builder()
                .studentId(studentId)
                .studentName(student.getFullName())
                .rollNumber(student.getRollNumber())
                .roomNumber(student.getRoomNumber())
                .hostelBlock(student.getHostelBlock())
                .reason(reason != null ? reason : "Graduation / Vacating Hostel")
                .wardenCleared(false)
                .messCleared(false)
                .maintenanceCleared(false)
                .accountsCleared(false)
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();

        NoDuesRequest saved = noDuesRepo.save(req);

        notificationService.notifyWardens(
                Notification.NotificationType.NO_DUES_UPDATE,
                "New No-Dues Application",
                student.getFullName() + " applied for digital hostel clearance.",
                saved.getId()
        );

        return saved;
    }

    public Optional<NoDuesRequest> getStudentNoDues(String studentId) {
        return noDuesRepo.findByStudentId(studentId);
    }

    public List<NoDuesRequest> getAllNoDues() {
        return noDuesRepo.findAllByOrderByCreatedAtDesc();
    }

    public NoDuesRequest signoffDepartment(String requestId, String department, boolean cleared, String remarks) {
        NoDuesRequest req = noDuesRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("No-Dues request not found"));

        switch (department.toUpperCase()) {
            case "WARDEN" -> {
                req.setWardenCleared(cleared);
                req.setWardenRemarks(remarks);
            }
            case "MESS" -> {
                req.setMessCleared(cleared);
                req.setMessRemarks(remarks);
            }
            case "MAINTENANCE" -> {
                req.setMaintenanceCleared(cleared);
                req.setMaintenanceRemarks(remarks);
            }
            case "ACCOUNTS" -> {
                req.setAccountsCleared(cleared);
                req.setAccountsRemarks(remarks);
            }
            default -> throw new RuntimeException("Unknown department: " + department);
        }

        if (req.isWardenCleared() && req.isMessCleared() && req.isMaintenanceCleared() && req.isAccountsCleared()) {
            req.setStatus("APPROVED");
            req.setCertificateId("HF-CERT-" + LocalDate.now().getYear() + "-" + req.getRollNumber());
            req.setCompletedAt(LocalDateTime.now());

            notificationService.createNotification(
                    req.getStudentId(),
                    Notification.NotificationType.NO_DUES_UPDATE,
                    "🎉 Hostel No-Dues Clearance Completed!",
                    "All departments have signed off. Your clearance certificate (" + req.getCertificateId() + ") is ready to download.",
                    req.getId()
            );
        }

        return noDuesRepo.save(req);
    }
}
