package com.hostelflow.service;

import com.hostelflow.model.*;
import com.hostelflow.repository.RoomInventoryRepository;
import com.hostelflow.repository.RoomSwapRequestRepository;
import com.hostelflow.repository.UserRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class RoomManagementService {

    private final UserRepository userRepo;
    private final RoomSwapRequestRepository swapRepo;
    private final RoomInventoryRepository inventoryRepo;
    private final NotificationService notificationService;

    @Data
    @Builder
    public static class BedInfo {
        private int bedNumber; // 1 or 2
        private String status; // OCCUPIED, VACANT, MAINTENANCE
        private String studentId;
        private String studentName;
        private String rollNumber;
        private String course;
        private String riskLevel;
    }

    @Data
    @Builder
    public static class RoomInfo {
        private String roomNumber;
        private String block;
        private int floor;
        private List<BedInfo> beds;
    }

    @Data
    @Builder
    public static class RoomMatrixSummary {
        private int totalBeds;
        private int occupiedBeds;
        private int vacantBeds;
        private double occupancyRate;
        private List<RoomInfo> rooms;
    }

    public RoomMatrixSummary getRoomMatrix() {
        List<User> students = userRepo.findByRole(User.Role.STUDENT);
        Map<String, List<User>> roomMap = new HashMap<>();
        for (User s : students) {
            if (s.getRoomNumber() != null && !s.getRoomNumber().isBlank()) {
                String key = s.getRoomNumber().toUpperCase().trim();
                roomMap.computeIfAbsent(key, k -> new ArrayList<>()).add(s);
            }
        }

        List<RoomInfo> allRooms = new ArrayList<>();
        int totalBeds = 0;
        int occupiedBeds = 0;

        // Generate rooms for Block A and Block B (Floors 1-3, rooms 101-106, 201-206, 301-306)
        for (String block : List.of("A", "B")) {
            for (int floor = 1; floor <= 3; floor++) {
                for (int r = 1; r <= 6; r++) {
                    String roomNumber = block + "-" + (floor * 100 + r);
                    totalBeds += 2;

                    List<User> occupants = roomMap.getOrDefault(roomNumber, Collections.emptyList());
                    List<BedInfo> beds = new ArrayList<>();

                    // Bed 1
                    if (occupants.size() > 0) {
                        User u = occupants.get(0);
                        occupiedBeds++;
                        beds.add(BedInfo.builder()
                                .bedNumber(1)
                                .status("OCCUPIED")
                                .studentId(u.getId())
                                .studentName(u.getFullName())
                                .rollNumber(u.getRollNumber())
                                .course(u.getCourse())
                                .riskLevel(u.getRiskLevel() != null ? u.getRiskLevel().name() : "LOW")
                                .build());
                    } else {
                        beds.add(BedInfo.builder().bedNumber(1).status("VACANT").build());
                    }

                    // Bed 2
                    if (occupants.size() > 1) {
                        User u = occupants.get(1);
                        occupiedBeds++;
                        beds.add(BedInfo.builder()
                                .bedNumber(2)
                                .status("OCCUPIED")
                                .studentId(u.getId())
                                .studentName(u.getFullName())
                                .rollNumber(u.getRollNumber())
                                .course(u.getCourse())
                                .riskLevel(u.getRiskLevel() != null ? u.getRiskLevel().name() : "LOW")
                                .build());
                    } else {
                        beds.add(BedInfo.builder().bedNumber(2).status("VACANT").build());
                    }

                    allRooms.add(RoomInfo.builder()
                            .roomNumber(roomNumber)
                            .block(block)
                            .floor(floor)
                            .beds(beds)
                            .build());
                }
            }
        }

        int vacantBeds = Math.max(0, totalBeds - occupiedBeds);
        double rate = totalBeds > 0 ? (occupiedBeds * 100.0 / totalBeds) : 0.0;

        return RoomMatrixSummary.builder()
                .totalBeds(totalBeds)
                .occupiedBeds(occupiedBeds)
                .vacantBeds(vacantBeds)
                .occupancyRate(Math.round(rate * 10.0) / 10.0)
                .rooms(allRooms)
                .build();
    }

    public RoomSwapRequest initiateSwap(String applicantId, String targetRollOrRoom, String reason) {
        User applicant = userRepo.findById(applicantId)
                .orElseThrow(() -> new RuntimeException("Applicant student not found"));

        User target = userRepo.findByRollNumber(targetRollOrRoom)
                .or(() -> {
                    List<User> list = userRepo.findByRole(User.Role.STUDENT);
                    return list.stream().filter(u -> targetRollOrRoom.equalsIgnoreCase(u.getRoomNumber())).findFirst();
                })
                .orElseThrow(() -> new RuntimeException("Target student/room not found: " + targetRollOrRoom));

        if (applicant.getId().equals(target.getId())) {
            throw new RuntimeException("Cannot swap room with yourself");
        }

        RoomSwapRequest req = RoomSwapRequest.builder()
                .applicantStudentId(applicant.getId())
                .applicantName(applicant.getFullName())
                .applicantRoll(applicant.getRollNumber())
                .applicantRoom(applicant.getRoomNumber())
                .applicantBlock(applicant.getHostelBlock())
                .targetStudentId(target.getId())
                .targetName(target.getFullName())
                .targetRoll(target.getRollNumber())
                .targetRoom(target.getRoomNumber())
                .targetBlock(target.getHostelBlock())
                .reason(reason)
                .status("PENDING_PEER")
                .createdAt(LocalDateTime.now())
                .build();

        RoomSwapRequest saved = swapRepo.save(req);

        notificationService.createNotification(
                target.getId(),
                Notification.NotificationType.ROOM_SWAP_REQUEST,
                "Room Swap Request",
                applicant.getFullName() + " has requested to swap rooms with you (" + applicant.getRoomNumber() + " ↔ " + target.getRoomNumber() + ").",
                saved.getId()
        );

        return saved;
    }

    public RoomSwapRequest peerAction(String swapId, String studentId, boolean approved, String remark) {
        RoomSwapRequest req = swapRepo.findById(swapId)
                .orElseThrow(() -> new RuntimeException("Swap request not found"));

        if (!studentId.equals(req.getTargetStudentId())) {
            throw new RuntimeException("Only the requested peer student can perform this action");
        }

        req.setPeerRemark(remark);
        req.setUpdatedAt(LocalDateTime.now());

        if (approved) {
            req.setStatus("PENDING_WARDEN");
            notificationService.notifyWardens(
                    Notification.NotificationType.ROOM_SWAP_REQUEST,
                    "Room Swap Pending Warden Approval",
                    req.getApplicantName() + " and " + req.getTargetName() + " agreed to swap rooms (" + req.getApplicantRoom() + " ↔ " + req.getTargetRoom() + ").",
                    req.getId()
            );
        } else {
            req.setStatus("REJECTED");
            notificationService.createNotification(
                    req.getApplicantStudentId(),
                    Notification.NotificationType.ROOM_SWAP_REJECTED,
                    "Room Swap Rejected",
                    req.getTargetName() + " declined the room swap request.",
                    req.getId()
            );
        }

        return swapRepo.save(req);
    }

    public RoomSwapRequest wardenAction(String swapId, String wardenName, boolean approved, String remark) {
        RoomSwapRequest req = swapRepo.findById(swapId)
                .orElseThrow(() -> new RuntimeException("Swap request not found"));

        req.setWardenRemark(remark);
        req.setUpdatedAt(LocalDateTime.now());

        if (approved) {
            req.setStatus("APPROVED");

            // Perform actual database swap
            User applicant = userRepo.findById(req.getApplicantStudentId()).orElse(null);
            User target = userRepo.findById(req.getTargetStudentId()).orElse(null);

            if (applicant != null && target != null) {
                String tempRoom = applicant.getRoomNumber();
                String tempBlock = applicant.getHostelBlock();

                applicant.setRoomNumber(target.getRoomNumber());
                applicant.setHostelBlock(target.getHostelBlock());

                target.setRoomNumber(tempRoom);
                target.setHostelBlock(tempBlock);

                userRepo.save(applicant);
                userRepo.save(target);
            }

            notificationService.createNotification(
                    req.getApplicantStudentId(),
                    Notification.NotificationType.ROOM_SWAP_APPROVED,
                    "Room Swap Approved! 🎉",
                    "Warden approved your room swap! Your new room is " + req.getTargetRoom(),
                    req.getId()
            );

            notificationService.createNotification(
                    req.getTargetStudentId(),
                    Notification.NotificationType.ROOM_SWAP_APPROVED,
                    "Room Swap Approved! 🎉",
                    "Warden approved the room swap! Your new room is " + req.getApplicantRoom(),
                    req.getId()
            );

        } else {
            req.setStatus("REJECTED");
            notificationService.createNotification(
                    req.getApplicantStudentId(),
                    Notification.NotificationType.ROOM_SWAP_REJECTED,
                    "Room Swap Declined by Warden",
                    "Reason: " + remark,
                    req.getId()
            );
        }

        return swapRepo.save(req);
    }

    public List<RoomSwapRequest> getStudentSwaps(String studentId) {
        return swapRepo.findByApplicantStudentIdOrTargetStudentIdOrderByCreatedAtDesc(studentId, studentId);
    }

    public List<RoomSwapRequest> getAllSwaps() {
        return swapRepo.findAllByOrderByCreatedAtDesc();
    }

    public RoomInventory saveInventory(RoomInventory inv) {
        inv.setUpdatedAt(LocalDateTime.now());
        return inventoryRepo.save(inv);
    }

    public Optional<RoomInventory> getInventoryForStudent(String studentId) {
        return inventoryRepo.findByStudentId(studentId);
    }

    public List<RoomInventory> getAllInventories() {
        return inventoryRepo.findAllByOrderByUpdatedAtDesc();
    }
}
