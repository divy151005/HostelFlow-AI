package com.hostelflow.service;

import com.hostelflow.model.MaintenanceTask;
import com.hostelflow.model.Notification;
import com.hostelflow.model.User;
import com.hostelflow.repository.MaintenanceTaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class MaintenanceService {

    private final MaintenanceTaskRepository taskRepo;
    private final NotificationService notificationService;

    public MaintenanceTask createTask(User actor, MaintenanceTask input) {
        LocalDateTime now = LocalDateTime.now();
        MaintenanceTask task = MaintenanceTask.builder()
                .title(input.getTitle())
                .description(input.getDescription())
                .category(input.getCategory() == null ? "OTHER" : input.getCategory().toUpperCase())
                .priority(input.getPriority() == null ? "NORMAL" : input.getPriority().toUpperCase())
                .roomNumber(input.getRoomNumber())
                .hostelBlock(input.getHostelBlock() == null ? "A" : input.getHostelBlock())
                .status("PENDING")
                .reportedBy(actor.getFullName())
                .studentId(input.getStudentId())
                .complaintId(input.getComplaintId())
                .assignedStaffName(input.getAssignedStaffName())
                .assignedStaffPhone(input.getAssignedStaffPhone())
                .createdAt(now)
                .updatedAt(now)
                .history(new ArrayList<>(List.of(
                        MaintenanceTask.TaskAction.builder()
                                .actorId(actor.getId())
                                .actorName(actor.getFullName())
                                .action("CREATED")
                                .note("Maintenance task created: " + input.getTitle())
                                .at(now)
                                .build()
                )))
                .build();

        if (task.getAssignedStaffName() != null && !task.getAssignedStaffName().isBlank()) {
            task.setStatus("ASSIGNED");
        }

        return taskRepo.save(task);
    }

    public MaintenanceTask updateTask(User actor, String taskId, Map<String, String> body) {
        MaintenanceTask task = taskRepo.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        LocalDateTime now = LocalDateTime.now();
        String newStatus = body.getOrDefault("status", task.getStatus()).toUpperCase();
        task.setStatus(newStatus);

        if (body.containsKey("assignedStaffName")) task.setAssignedStaffName(body.get("assignedStaffName"));
        if (body.containsKey("assignedStaffPhone")) task.setAssignedStaffPhone(body.get("assignedStaffPhone"));
        if (body.containsKey("resolutionNotes")) task.setResolutionNotes(body.get("resolutionNotes"));

        if ("COMPLETED".equals(newStatus)) {
            task.setCompletedAt(now);
            if (task.getStudentId() != null) {
                notificationService.createNotification(
                        task.getStudentId(),
                        Notification.NotificationType.MAINTENANCE_UPDATE,
                        "Maintenance Completed",
                        "The maintenance task for Room " + task.getRoomNumber() + " (" + task.getTitle() + ") is completed.",
                        task.getId()
                );
            }
        }

        task.setUpdatedAt(now);
        task.getHistory().add(
                MaintenanceTask.TaskAction.builder()
                        .actorId(actor.getId())
                        .actorName(actor.getFullName())
                        .action(newStatus)
                        .note(body.getOrDefault("note", "Status updated to " + newStatus))
                        .at(now)
                        .build()
        );

        return taskRepo.save(task);
    }

    public List<MaintenanceTask> getAllTasks() {
        return taskRepo.findAllByOrderByCreatedAtDesc();
    }

    public Map<String, Object> getMaintenanceStats() {
        List<MaintenanceTask> all = taskRepo.findAll();
        long pending = all.stream().filter(t -> "PENDING".equalsIgnoreCase(t.getStatus())).count();
        long assigned = all.stream().filter(t -> "ASSIGNED".equalsIgnoreCase(t.getStatus())).count();
        long inProgress = all.stream().filter(t -> "IN_PROGRESS".equalsIgnoreCase(t.getStatus())).count();
        long completed = all.stream().filter(t -> "COMPLETED".equalsIgnoreCase(t.getStatus())).count();

        // Recurring room issues: count tasks per room
        Map<String, Long> roomCounts = new HashMap<>();
        for (MaintenanceTask t : all) {
            if (t.getRoomNumber() != null && !t.getRoomNumber().isBlank()) {
                roomCounts.put(t.getRoomNumber(), roomCounts.getOrDefault(t.getRoomNumber(), 0L) + 1);
            }
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("total", all.size());
        stats.put("pending", pending);
        stats.put("assigned", assigned);
        stats.put("inProgress", inProgress);
        stats.put("completed", completed);
        stats.put("roomIssueCounts", roomCounts);
        return stats;
    }
}
