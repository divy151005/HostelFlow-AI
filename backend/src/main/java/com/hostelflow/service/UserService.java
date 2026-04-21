package com.hostelflow.service;

import com.hostelflow.model.User;
import com.hostelflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> findById(String id) {
        return userRepository.findById(id);
    }

    public List<User> getAllStudents() {
        return userRepository.findByRole(User.Role.STUDENT);
    }

    public List<User> getAllWardens() {
        return userRepository.findByRole(User.Role.WARDEN);
    }

    public User updateFcmToken(String userId, String fcmToken) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setFcmToken(fcmToken);
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    public User updateProfile(String userId, String fullName, String phone) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setFullName(fullName);
        user.setPhone(phone);
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    public void changePassword(String userId, String oldPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Old password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    public User linkParentToStudent(String parentId, String studentId) {
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Parent not found"));
        userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        parent.setLinkedStudentId(studentId);
        parent.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(parent);
    }
}
