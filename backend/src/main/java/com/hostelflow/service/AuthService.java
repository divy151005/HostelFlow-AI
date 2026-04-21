package com.hostelflow.service;

import com.hostelflow.dto.request.AuthDTOs.*;
import com.hostelflow.dto.response.AuthResponse;
import com.hostelflow.model.User;
import com.hostelflow.repository.UserRepository;
import com.hostelflow.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final com.hostelflow.security.service.CustomUserDetailsService userDetailsService;

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User.Role role = User.Role.valueOf(req.getRole().toUpperCase());

        User user = User.builder()
                .fullName(req.getFullName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .phone(req.getPhone())
                .role(role)
                .enabled(true)
                .accountNonLocked(true)
                .lateReturnCount(0)
                .riskLevel(User.RiskLevel.LOW)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        if (role == User.Role.STUDENT) {
            user.setRollNumber(req.getRollNumber());
            user.setRoomNumber(req.getRoomNumber());
            user.setHostelBlock(req.getHostelBlock());
            user.setCourse(req.getCourse());
            user.setYear(req.getYear());
            user.setParentEmail(req.getParentEmail());
            user.setMentorEmail(req.getMentorEmail());
        }

        if (role == User.Role.PARENT) {
            user.setLinkedStudentId(req.getLinkedStudentId());
        }

        if (role == User.Role.WARDEN || role == User.Role.MENTOR) {
            user.setAssignedBlock(req.getAssignedBlock());
        }

        User saved = userRepository.save(user);
        return generateAuthResponse(saved);
    }

    public AuthResponse login(LoginRequest req) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
        );

        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return generateAuthResponse(user);
    }

    public AuthResponse refreshToken(RefreshTokenRequest req) {
        String email = jwtUtil.extractUsername(req.getRefreshToken());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        if (!jwtUtil.isTokenValid(req.getRefreshToken(), userDetails)) {
            throw new RuntimeException("Invalid refresh token");
        }
        return generateAuthResponse(user);
    }

    private AuthResponse generateAuthResponse(User user) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String accessToken = jwtUtil.generateToken(userDetails, user.getId(), user.getRole().name());
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtUtil.getExpiration())
                .user(AuthResponse.UserInfo.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .fullName(user.getFullName())
                        .role(user.getRole().name())
                        .rollNumber(user.getRollNumber())
                        .roomNumber(user.getRoomNumber())
                        .hostelBlock(user.getHostelBlock())
                        .riskLevel(user.getRiskLevel() != null ? user.getRiskLevel().name() : "LOW")
                        .lateReturnCount(user.getLateReturnCount())
                        .build())
                .build();
    }
}
