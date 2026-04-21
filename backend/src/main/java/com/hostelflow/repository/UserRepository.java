package com.hostelflow.repository;

import com.hostelflow.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByRollNumber(String rollNumber);
    boolean existsByEmail(String email);
    boolean existsByRollNumber(String rollNumber);
    List<User> findByRole(User.Role role);
    List<User> findByHostelBlock(String block);

    @Query("{'role': 'STUDENT', 'lateReturnCount': {$gte: ?0}}")
    List<User> findStudentsWithLateCount(int minLateCount);

    @Query("{'role': 'STUDENT', 'riskLevel': ?0}")
    List<User> findStudentsByRiskLevel(User.RiskLevel riskLevel);

    Optional<User> findByLinkedStudentId(String studentId);
}
