package com.hostelflow.controller;

import com.hostelflow.dto.response.ApiResponse;
import com.hostelflow.model.ChatMessage;
import com.hostelflow.model.User;
import com.hostelflow.repository.UserRepository;
import com.hostelflow.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final UserRepository userRepo;

    private User getUser(UserDetails ud) {
        return userRepo.findByEmail(ud.getUsername()).orElseThrow();
    }

    @GetMapping("/contacts")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getContacts(
            @AuthenticationPrincipal UserDetails ud) {
        User user = getUser(ud);
        return ResponseEntity.ok(ApiResponse.ok(chatService.getContacts(user)));
    }

    @GetMapping("/messages")
    public ResponseEntity<ApiResponse<List<ChatMessage>>> getMessages(
            @AuthenticationPrincipal UserDetails ud,
            @RequestParam String partnerId) {
        User user = getUser(ud);
        return ResponseEntity.ok(ApiResponse.ok(chatService.getMessages(user, partnerId)));
    }

    @PostMapping("/messages")
    public ResponseEntity<ApiResponse<ChatMessage>> sendMessage(
            @AuthenticationPrincipal UserDetails ud,
            @RequestBody Map<String, String> body) {
        User user = getUser(ud);
        String recipientId = body.get("recipientId");
        String content = body.get("content");
        return ResponseEntity.ok(ApiResponse.ok("Message sent",
                chatService.sendMessage(user, recipientId, content)));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(
            @AuthenticationPrincipal UserDetails ud) {
        User user = getUser(ud);
        return ResponseEntity.ok(ApiResponse.ok(chatService.getUnreadCount(user)));
    }
}
