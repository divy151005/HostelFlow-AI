package com.hostelflow.service;

import com.hostelflow.dto.request.LeaveDTOs.*;
import com.hostelflow.model.*;
import com.hostelflow.repository.*;
import com.hostelflow.util.QRCodeUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
public class LeaveService {

    private final LeaveRequestRepository leaveRepo;
    private final UserRepository userRepo;
    private final NotificationService notificationService;
    private final QRCodeUtil qrCodeUtil;
    private final AiRiskService aiRiskService;

    // ── Student: Apply for Leave/Outing ──
    public LeaveRequest applyLeave(String studentId, CreateLeaveRequest req) {
        User student = userRepo.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // Check no active leave
        List<LeaveRequest> active = leaveRepo.findByStudentIdAndStatus(studentId, LeaveRequest.Status.APPROVED);
        if (!active.isEmpty()) throw new RuntimeException("You already have an active approved leave");

        LeaveRequest.LeaveType leaveType = LeaveRequest.LeaveType.valueOf(req.getType().toUpperCase(Locale.ROOT));
        LeaveRequest.OutingKind outingKind = resolveOutingKind(req.getOutingKind(), leaveType);
        boolean needsParentApproval = requiresParentApproval(leaveType, outingKind)
                && hasLinkedParent(student.getId());

        String qrToken = qrCodeUtil.generateQRToken();
        String qrCode = qrCodeUtil.generateQRCodeBase64(qrToken);

        LeaveRequest leave = LeaveRequest.builder()
                .studentId(studentId)
                .studentName(student.getFullName())
                .rollNumber(student.getRollNumber())
                .roomNumber(student.getRoomNumber())
                .type(leaveType)
                .outingKind(outingKind)
                .reason(req.getReason())
                .destination(req.getDestination())
                .fromDate(req.getFromDate())
                .toDate(req.getToDate())
                .expectedReturn(req.getExpectedReturn())
                .status(initialStatusFor(leaveType))
                .qrToken(qrToken)
                .qrCode(qrCode)
                .parentApprovalRequired(needsParentApproval)
                .qrScannedOut(false)
                .qrScannedIn(false)
                .isLate(false)
                .escalated(false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        LeaveRequest saved = leaveRepo.save(leave);

        if (leaveType == LeaveRequest.LeaveType.OUTING) {
            notificationService.notifyMentors(
                    Notification.NotificationType.MENTOR_APPROVAL_NEEDED,
                    "New Outing Needs Mentor Approval",
                    student.getFullName() + " (" + student.getRollNumber() + ") requested "
                            + formatOutingKind(saved.getOutingKind()) + ".",
                    saved.getId()
            );
        } else {
            notificationService.notifyWardens(
                    Notification.NotificationType.LEAVE_SUBMITTED,
                    "New Leave Request",
                    student.getFullName() + " (" + student.getRollNumber() + ") applied for " + req.getType(),
                    saved.getId()
            );
        }

        return saved;
    }

    // ── Warden: Approve or Reject ──
    public LeaveRequest wardenAction(String leaveId, String wardenId, ApproveRejectRequest req) {
        LeaveRequest leave = leaveRepo.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));

        if (leave.getStatus() != LeaveRequest.Status.PENDING_WARDEN) {
            throw new RuntimeException("Leave is not pending warden approval");
        }

        boolean approved = "APPROVE".equalsIgnoreCase(req.getAction());
        leave.setWardenApproved(approved);
        leave.setWardenRemark(req.getRemark());
        leave.setApprovedBy(wardenId);
        leave.setUpdatedAt(LocalDateTime.now());

        if (approved) {
            // Check if parent approval needed (for multi-day leave)
            if (leave.isParentApprovalRequired()) {
                leave.setStatus(LeaveRequest.Status.PENDING_PARENT);
                notifyParentApprovalRequired(leave, "Leave Approval Required",
                        "Your ward has applied for leave. Your approval is needed.");
            } else {
                leave.setStatus(LeaveRequest.Status.APPROVED);
                notificationService.createNotification(
                    leave.getStudentId(),
                    Notification.NotificationType.LEAVE_APPROVED,
                    "Leave Approved!",
                    "Your leave request has been approved by the warden.",
                    leaveId
                );
            }
        } else {
            leave.setStatus(LeaveRequest.Status.REJECTED);
            notificationService.createNotification(
                leave.getStudentId(),
                Notification.NotificationType.LEAVE_REJECTED,
                "Leave Rejected",
                "Your leave was rejected. Reason: " + req.getRemark(),
                leaveId
            );
        }

        return leaveRepo.save(leave);
    }

    public LeaveRequest mentorAction(String leaveId, String mentorId, ApproveRejectRequest req) {
        LeaveRequest leave = leaveRepo.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));

        if (leave.getStatus() != LeaveRequest.Status.PENDING_MENTOR) {
            throw new RuntimeException("Leave is not pending mentor approval");
        }

        boolean approved = "APPROVE".equalsIgnoreCase(req.getAction());
        leave.setMentorApproved(approved);
        leave.setMentorRemark(req.getRemark());
        leave.setMentorApprovedBy(mentorId);
        leave.setUpdatedAt(LocalDateTime.now());

        if (approved) {
            if (leave.isParentApprovalRequired()) {
                leave.setStatus(LeaveRequest.Status.PENDING_PARENT);
                notifyParentApprovalRequired(leave, "Outing Approval Required",
                        "Your ward's " + formatOutingKind(leave.getOutingKind()) + " outing needs your approval.");
                notificationService.createNotification(
                        leave.getStudentId(),
                        Notification.NotificationType.MENTOR_APPROVAL_NEEDED,
                        "Mentor Approved",
                        "Your outing has been approved by the mentor and sent to your parent.",
                        leave.getId()
                );
            } else {
                leave.setStatus(LeaveRequest.Status.APPROVED);
                notificationService.createNotification(
                        leave.getStudentId(),
                        Notification.NotificationType.LEAVE_APPROVED,
                        "Outing Approved!",
                        "Your outing request has been approved by the mentor.",
                        leave.getId()
                );
            }
        } else {
            leave.setStatus(LeaveRequest.Status.REJECTED);
            notificationService.createNotification(
                    leave.getStudentId(),
                    Notification.NotificationType.LEAVE_REJECTED,
                    "Outing Rejected",
                    "Your outing was rejected by the mentor. Reason: " + req.getRemark(),
                    leave.getId()
            );
        }

        return leaveRepo.save(leave);
    }

    // ── Parent: Approve or Reject ──
    public LeaveRequest parentAction(String parentId, ParentApprovalRequest req) {
        LeaveRequest leave = leaveRepo.findById(req.getLeaveId())
                .orElseThrow(() -> new RuntimeException("Leave not found"));
        User parent = userRepo.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Parent not found"));

        if (leave.getStatus() != LeaveRequest.Status.PENDING_PARENT) {
            throw new RuntimeException("Leave is not awaiting parent approval");
        }
        if (!leave.getStudentId().equals(parent.getLinkedStudentId())) {
            throw new RuntimeException("Unauthorized");
        }

        boolean approved = "YES".equalsIgnoreCase(req.getAction());
        leave.setParentApproved(approved);
        leave.setParentRemark(req.getMessage());
        leave.setUpdatedAt(LocalDateTime.now());

        if (approved) {
            leave.setStatus(LeaveRequest.Status.APPROVED);
            notificationService.createNotification(
                leave.getStudentId(),
                Notification.NotificationType.LEAVE_APPROVED,
                "Leave Approved!",
                parentApprovalSuccessMessage(leave),
                leave.getId()
            );
        } else {
            leave.setStatus(LeaveRequest.Status.REJECTED);
            notificationService.createNotification(
                leave.getStudentId(),
                Notification.NotificationType.LEAVE_REJECTED,
                "Leave Rejected by Parent",
                "Your parent did not approve the leave.",
                leave.getId()
            );
        }

        return leaveRepo.save(leave);
    }

    // ── QR Scan: Entry / Exit ──
    public LeaveRequest processQRScan(QRScanRequest req) {
        LeaveRequest leave = leaveRepo.findByQrToken(req.getQrToken())
                .orElseThrow(() -> new RuntimeException("Invalid QR token"));

        if (leave.getStatus() != LeaveRequest.Status.APPROVED) {
            throw new RuntimeException("Leave is not in approved state");
        }

        LocalDateTime now = LocalDateTime.now();

        if ("OUT".equalsIgnoreCase(req.getScanType())) {
            if (leave.isQrScannedOut()) throw new RuntimeException("Already scanned out");
            leave.setQrScannedOut(true);
            leave.setScannedOutAt(now);
            notificationService.createNotification(
                leave.getStudentId(),
                Notification.NotificationType.QR_SCANNED,
                "Gate Pass Scanned — Exit",
                "You have been checked out at " + now,
                leave.getId()
            );
        } else {
            if (!leave.isQrScannedOut()) throw new RuntimeException("Not yet scanned out");
            if (leave.isQrScannedIn()) throw new RuntimeException("Already scanned in");
            leave.setQrScannedIn(true);
            leave.setActualReturn(now);

            // Check late return
            if (now.isAfter(leave.getExpectedReturn())) {
                long minutesLate = ChronoUnit.MINUTES.between(leave.getExpectedReturn(), now);
                leave.setLate(true);
                leave.setLateByMinutes(minutesLate);
                leave.setStatus(LeaveRequest.Status.LATE);

                // Update student late count
                User student = userRepo.findById(leave.getStudentId()).orElseThrow();
                int newCount = (student.getLateReturnCount() == null ? 0 : student.getLateReturnCount()) + 1;
                student.setLateReturnCount(newCount);

                // AI risk assessment
                User.RiskLevel newRisk = aiRiskService.assessRisk(student.getId(), newCount);
                student.setRiskLevel(newRisk);
                userRepo.save(student);

                notificationService.notifyWardens(
                    Notification.NotificationType.LATE_RETURN,
                    "⚠️ Late Return",
                    leave.getStudentName() + " is " + minutesLate + " minutes late!",
                    leave.getId()
                );

                if (newRisk == User.RiskLevel.HIGH) {
                    notificationService.notifyWardens(
                        Notification.NotificationType.HIGH_RISK_ALERT,
                        "🚨 HIGH RISK Student",
                        leave.getStudentName() + " flagged HIGH RISK after " + newCount + " late returns",
                        leave.getId()
                    );
                }
            } else {
                leave.setStatus(LeaveRequest.Status.COMPLETED);
            }

            notificationService.createNotification(
                leave.getStudentId(),
                Notification.NotificationType.QR_SCANNED,
                "Gate Pass Scanned — Entry",
                "Welcome back! Scanned in at " + now,
                leave.getId()
            );
        }

        leave.setUpdatedAt(now);
        return leaveRepo.save(leave);
    }

    // ── Get Student History ──
    public Page<LeaveRequest> getStudentHistory(String studentId, int page, int size) {
        return leaveRepo.findByStudentId(studentId, PageRequest.of(page, size, Sort.by("createdAt").descending()));
    }

    // ── Warden: All Requests ──
    public Page<LeaveRequest> getAllRequests(String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        if (status != null && !status.isBlank()) {
            return leaveRepo.findByStatus(LeaveRequest.Status.valueOf(status.toUpperCase()), pageable);
        }
        return leaveRepo.findAll(pageable);
    }

    // ── Warden: Currently Out Students ──
    public List<LeaveRequest> getCurrentlyOut() {
        return leaveRepo.findCurrentlyOut();
    }

    // ── Cancel Leave ──
    public LeaveRequest cancelLeave(String leaveId, String studentId) {
        LeaveRequest leave = leaveRepo.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave not found"));
        if (!leave.getStudentId().equals(studentId))
            throw new RuntimeException("Unauthorized");
        if (leave.isQrScannedOut())
            throw new RuntimeException("Cannot cancel — already scanned out");
        leave.setStatus(LeaveRequest.Status.CANCELLED);
        leave.setUpdatedAt(LocalDateTime.now());
        return leaveRepo.save(leave);
    }

    private LeaveRequest.Status initialStatusFor(LeaveRequest.LeaveType type) {
        return type == LeaveRequest.LeaveType.OUTING
                ? LeaveRequest.Status.PENDING_MENTOR
                : LeaveRequest.Status.PENDING_WARDEN;
    }

    private LeaveRequest.OutingKind resolveOutingKind(String outingKind, LeaveRequest.LeaveType leaveType) {
        if (leaveType != LeaveRequest.LeaveType.OUTING) {
            return null;
        }
        String value = outingKind == null || outingKind.isBlank() ? "OTHER" : outingKind;
        return LeaveRequest.OutingKind.valueOf(value.toUpperCase(Locale.ROOT));
    }

    private boolean requiresParentApproval(LeaveRequest.LeaveType leaveType, LeaveRequest.OutingKind outingKind) {
        if (leaveType == LeaveRequest.LeaveType.LEAVE) {
            return true;
        }
        if (leaveType != LeaveRequest.LeaveType.OUTING || outingKind == null) {
            return false;
        }
        return outingKind == LeaveRequest.OutingKind.WORKING_HOURS
                || outingKind == LeaveRequest.OutingKind.RUNNING_COLLEGE;
    }

    private boolean hasLinkedParent(String studentId) {
        return userRepo.findByLinkedStudentId(studentId).isPresent();
    }

    private void notifyParentApprovalRequired(LeaveRequest leave, String title, String message) {
        userRepo.findByLinkedStudentId(leave.getStudentId()).ifPresent(parent ->
                notificationService.createNotification(
                        parent.getId(),
                        Notification.NotificationType.PARENT_APPROVAL_NEEDED,
                        title,
                        message,
                        leave.getId()
                )
        );
    }

    private String parentApprovalSuccessMessage(LeaveRequest leave) {
        if (leave.getType() == LeaveRequest.LeaveType.OUTING) {
            return "Your outing has been approved by the mentor and parent.";
        }
        return "Both warden and parent have approved your leave.";
    }

    private String formatOutingKind(LeaveRequest.OutingKind outingKind) {
        if (outingKind == null) {
            return "outing";
        }
        return outingKind.name().replace('_', ' ').toLowerCase(Locale.ROOT);
    }
}
