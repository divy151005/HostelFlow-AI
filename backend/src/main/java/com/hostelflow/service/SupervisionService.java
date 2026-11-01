package com.hostelflow.service;

import com.hostelflow.model.*;
import com.hostelflow.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class SupervisionService {

    private final UserRepository userRepo;
    private final LeaveRequestRepository leaveRepo;
    private final HostelComplaintRepository complaintRepo;
    private final StudentIncidentRepository incidentRepo;
    private final NotificationService notificationService;

    public Map<String, Object> getStudentActivity(String studentId) {
        User student = userRepo.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        List<LeaveRequest> leaves = leaveRepo.findByStudentIdOrderByCreatedAtDesc(studentId);
        List<HostelComplaint> complaints = complaintRepo.findByStudentIdOrderByCreatedAtDesc(studentId);
        List<StudentIncident> incidents = incidentRepo.findByStudentIdOrderByCreatedAtDesc(studentId);

        // Determine current status: OUTSIDE if any leave is scannedOut and not scannedIn
        boolean isCurrentlyOutside = leaves.stream()
                .anyMatch(l -> l.isQrScannedOut() && !l.isQrScannedIn());

        long totalExits = leaves.stream().filter(LeaveRequest::isQrScannedOut).count();
        long totalReturns = leaves.stream().filter(LeaveRequest::isQrScannedIn).count();
        long totalLate = leaves.stream().filter(LeaveRequest::isLate).count();

        // Check if currently overdue
        LocalDateTime now = LocalDateTime.now();
        boolean isOverdue = leaves.stream().anyMatch(l ->
                l.isQrScannedOut() && !l.isQrScannedIn() && l.getExpectedReturn() != null && now.isAfter(l.getExpectedReturn())
        );

        // Timeline of Gate Activity
        List<Map<String, Object>> timeline = new ArrayList<>();
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

        for (LeaveRequest l : leaves) {
            if (l.isQrScannedOut() && l.getScannedOutAt() != null) {
                Map<String, Object> outEvent = new HashMap<>();
                outEvent.put("type", "GATE_EXIT");
                outEvent.put("timestamp", l.getScannedOutAt());
                outEvent.put("formattedTime", l.getScannedOutAt().format(dtf));
                outEvent.put("reason", l.getReason());
                outEvent.put("outingKind", l.getOutingKind() != null ? l.getOutingKind().name() : l.getType().name());
                outEvent.put("destination", l.getDestination());
                outEvent.put("leaveId", l.getId());
                timeline.add(outEvent);
            }
            if (l.isQrScannedIn() && l.getScannedInAt() != null) {
                Map<String, Object> inEvent = new HashMap<>();
                inEvent.put("type", "GATE_RETURN");
                inEvent.put("timestamp", l.getScannedInAt());
                inEvent.put("formattedTime", l.getScannedInAt().format(dtf));
                inEvent.put("isLate", l.isLate());
                inEvent.put("lateByMinutes", l.getLateByMinutes());
                inEvent.put("leaveId", l.getId());
                timeline.add(inEvent);
            }
        }

        // Sort timeline by timestamp desc
        timeline.sort((a, b) -> ((LocalDateTime) b.get("timestamp")).compareTo((LocalDateTime) a.get("timestamp")));

        // Attendance calculation: Baseline attendance % (e.g. 100% minus 5% for excessive unexcused leaves/late returns)
        int calculatedAttendance = Math.max(70, Math.min(100, 100 - (int) (totalLate * 4)));

        Map<String, Object> result = new HashMap<>();
        result.put("student", student);
        result.put("currentStatus", isCurrentlyOutside ? "OUTSIDE" : "INSIDE");
        result.put("isOverdue", isOverdue);
        result.put("attendancePercentage", calculatedAttendance);
        result.put("totalLeaves", leaves.size());
        result.put("totalExits", totalExits);
        result.put("totalReturns", totalReturns);
        result.put("lateReturnsCount", totalLate);
        result.put("complaintCount", complaints.size());
        result.put("incidentCount", incidents.size());
        result.put("timeline", timeline);
        result.put("leaves", leaves);
        result.put("complaints", complaints);
        result.put("incidents", incidents);

        return result;
    }

    public Map<String, Object> triggerEmergencySOS(User student, String location, String note) {
        LocalDateTime now = LocalDateTime.now();

        // 1. Create emergency alert notice
        String title = "EMERGENCY SOS: " + student.getFullName();
        String msg = student.getFullName() + " (Room " + student.getRoomNumber() + ", Block " + student.getHostelBlock()
                + ", Phone: " + student.getPhone() + ") triggered an EMERGENCY SOS! Location/Note: "
                + (note != null && !note.isBlank() ? note : "Immediate assistance required");

        // Notify Wardens
        notificationService.notifyWardens(Notification.NotificationType.SOS_ALERT, title, msg, student.getId());

        // Notify Mentor
        notificationService.notifyStudentMentor(student.getId(), Notification.NotificationType.SOS_ALERT, title, msg, student.getId());

        // Notify Parent
        notificationService.notifyLinkedParent(student.getId(), Notification.NotificationType.SOS_ALERT, title, msg, student.getId());

        // Also record an incident
        StudentIncident incident = StudentIncident.builder()
                .studentId(student.getId())
                .studentName(student.getFullName())
                .rollNumber(student.getRollNumber())
                .roomNumber(student.getRoomNumber())
                .hostelBlock(student.getHostelBlock())
                .reportedById(student.getId())
                .reportedByName(student.getFullName())
                .type(StudentIncident.IncidentType.OTHER)
                .severity(StudentIncident.Severity.CRITICAL)
                .title(title)
                .description(msg)
                .status(StudentIncident.Status.REPORTED)
                .parentNotified(true)
                .mentorNotified(true)
                .createdAt(now)
                .updatedAt(now)
                .history(new ArrayList<>(List.of(
                        StudentIncident.IncidentAction.builder()
                                .actorId(student.getId())
                                .actorName(student.getFullName())
                                .action("SOS_TRIGGERED")
                                .note(msg)
                                .at(now)
                                .build()
                )))
                .build();
        incidentRepo.save(incident);

        Map<String, Object> resp = new HashMap<>();
        resp.put("status", "SOS_SENT");
        resp.put("time", now);
        resp.put("message", "Emergency alert dispatched to Warden, Mentor, and Parents.");
        return resp;
    }

    public Map<String, Object> getMentorAnalytics(User mentor) {
        List<User> students = userRepo.findByMentorEmail(mentor.getEmail());
        List<Map<String, Object>> studentCards = new ArrayList<>();

        int totalExitsAll = 0;
        int totalLateAll = 0;
        int totalLeavesAll = 0;
        int totalComplaintsAll = 0;

        for (User s : students) {
            Map<String, Object> act = getStudentActivity(s.getId());
            studentCards.add(act);

            totalExitsAll += ((Long) act.get("totalExits")).intValue();
            totalLateAll += ((Long) act.get("lateReturnsCount")).intValue();
            totalLeavesAll += ((Integer) act.get("totalLeaves"));
            totalComplaintsAll += ((Integer) act.get("complaintCount"));
        }

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalStudents", students.size());
        analytics.put("students", studentCards);
        analytics.put("totalExits", totalExitsAll);
        analytics.put("totalLateReturns", totalLateAll);
        analytics.put("totalLeaves", totalLeavesAll);
        analytics.put("totalComplaints", totalComplaintsAll);

        return analytics;
    }

    public Map<String, Object> getWardenSupervisionOverview() {
        List<User> allStudents = userRepo.findByRole(User.Role.STUDENT);
        List<LeaveRequest> allApprovedLeaves = leaveRepo.findByStatus(LeaveRequest.Status.APPROVED);
        LocalDateTime now = LocalDateTime.now();

        List<Map<String, Object>> outsideStudents = new ArrayList<>();
        List<Map<String, Object>> overdueStudents = new ArrayList<>();

        for (User s : allStudents) {
            List<LeaveRequest> sLeaves = leaveRepo.findByStudentIdOrderByCreatedAtDesc(s.getId());
            Optional<LeaveRequest> activeOut = sLeaves.stream()
                    .filter(l -> l.isQrScannedOut() && !l.isQrScannedIn())
                    .findFirst();

            if (activeOut.isPresent()) {
                LeaveRequest leave = activeOut.get();
                Map<String, Object> item = new HashMap<>();
                item.put("studentId", s.getId());
                item.put("studentName", s.getFullName());
                item.put("rollNumber", s.getRollNumber());
                item.put("roomNumber", s.getRoomNumber());
                item.put("phone", s.getPhone());
                item.put("parentEmail", s.getParentEmail());
                item.put("leaveId", leave.getId());
                item.put("destination", leave.getDestination());
                item.put("reason", leave.getReason());
                item.put("scannedOutAt", leave.getScannedOutAt());
                item.put("expectedReturn", leave.getExpectedReturn());

                outsideStudents.add(item);

                // Overdue check
                if (leave.getExpectedReturn() != null && now.isAfter(leave.getExpectedReturn())) {
                    long minutesLate = java.time.temporal.ChronoUnit.MINUTES.between(leave.getExpectedReturn(), now);
                    item.put("minutesLate", minutesLate);
                    overdueStudents.add(item);
                }
            }
        }

        Map<String, Object> overview = new HashMap<>();
        overview.put("totalStudents", allStudents.size());
        overview.put("currentlyInside", allStudents.size() - outsideStudents.size());
        overview.put("currentlyOutside", outsideStudents.size());
        overview.put("overdueCount", overdueStudents.size());
        overview.put("outsideStudents", outsideStudents);
        overview.put("overdueStudents", overdueStudents);
        overview.put("occupancyPercentage", allStudents.isEmpty() ? 0 : 85); // Standard occupancy estimate

        return overview;
    }
}
