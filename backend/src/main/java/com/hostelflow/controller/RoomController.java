package com.hostelflow.controller;

import com.hostelflow.dto.response.ApiResponse;
import com.hostelflow.model.RoomInventory;
import com.hostelflow.model.RoomSwapRequest;
import com.hostelflow.model.User;
import com.hostelflow.repository.UserRepository;
import com.hostelflow.service.RoomManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomManagementService roomService;
    private final UserRepository userRepo;

    private User getUser(UserDetails ud) {
        return userRepo.findByEmail(ud.getUsername()).orElseThrow();
    }

    @GetMapping("/matrix")
    public ResponseEntity<ApiResponse<RoomManagementService.RoomMatrixSummary>> getMatrix() {
        return ResponseEntity.ok(ApiResponse.ok(roomService.getRoomMatrix()));
    }

    // ── Room Swap ──
    @PostMapping("/swap/request")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<RoomSwapRequest>> requestSwap(
            @AuthenticationPrincipal UserDetails ud,
            @RequestBody Map<String, String> body) {
        User student = getUser(ud);
        String target = body.get("targetRollOrRoom");
        String reason = body.get("reason");
        return ResponseEntity.ok(ApiResponse.ok("Room swap requested",
                roomService.initiateSwap(student.getId(), target, reason)));
    }

    @PostMapping("/swap/{swapId}/peer-action")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<RoomSwapRequest>> peerAction(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable String swapId,
            @RequestBody Map<String, Object> body) {
        User student = getUser(ud);
        boolean approved = Boolean.parseBoolean(body.getOrDefault("approved", "false").toString());
        String remark = (String) body.getOrDefault("remark", "");
        return ResponseEntity.ok(ApiResponse.ok("Swap response recorded",
                roomService.peerAction(swapId, student.getId(), approved, remark)));
    }

    @PostMapping("/swap/{swapId}/warden-action")
    @PreAuthorize("hasAnyRole('WARDEN', 'ADMIN')")
    public ResponseEntity<ApiResponse<RoomSwapRequest>> wardenAction(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable String swapId,
            @RequestBody Map<String, Object> body) {
        User user = getUser(ud);
        boolean approved = Boolean.parseBoolean(body.getOrDefault("approved", "false").toString());
        String remark = (String) body.getOrDefault("remark", "");
        return ResponseEntity.ok(ApiResponse.ok("Warden decision applied",
                roomService.wardenAction(swapId, user.getFullName(), approved, remark)));
    }

    @GetMapping("/swap/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<RoomSwapRequest>>> getMySwaps(
            @AuthenticationPrincipal UserDetails ud) {
        User student = getUser(ud);
        return ResponseEntity.ok(ApiResponse.ok(roomService.getStudentSwaps(student.getId())));
    }

    @GetMapping("/swap/all")
    @PreAuthorize("hasAnyRole('WARDEN', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<RoomSwapRequest>>> getAllSwaps() {
        return ResponseEntity.ok(ApiResponse.ok(roomService.getAllSwaps()));
    }

    // ── Room Inventory Checklist ──
    @PostMapping("/inventory")
    public ResponseEntity<ApiResponse<RoomInventory>> saveInventory(
            @AuthenticationPrincipal UserDetails ud,
            @RequestBody RoomInventory inv) {
        User user = getUser(ud);
        if (user.getRole() == User.Role.STUDENT) {
            inv.setStudentId(user.getId());
            inv.setStudentName(user.getFullName());
            inv.setRoomNumber(user.getRoomNumber());
            inv.setHostelBlock(user.getHostelBlock());
        } else {
            inv.setVerifiedByWarden(true);
            inv.setVerifiedBy(user.getFullName());
        }
        return ResponseEntity.ok(ApiResponse.ok("Inventory saved", roomService.saveInventory(inv)));
    }

    @GetMapping("/inventory/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<RoomInventory>> getMyInventory(
            @AuthenticationPrincipal UserDetails ud) {
        User student = getUser(ud);
        return ResponseEntity.ok(ApiResponse.ok(
                roomService.getInventoryForStudent(student.getId()).orElse(null)));
    }

    @GetMapping("/inventory/all")
    @PreAuthorize("hasAnyRole('WARDEN', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<RoomInventory>>> getAllInventories() {
        return ResponseEntity.ok(ApiResponse.ok(roomService.getAllInventories()));
    }
}
