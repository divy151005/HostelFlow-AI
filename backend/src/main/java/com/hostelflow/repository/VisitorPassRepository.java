package com.hostelflow.repository;

import com.hostelflow.model.VisitorPass;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;
import java.util.List;

public interface VisitorPassRepository extends MongoRepository<VisitorPass, String> {
    List<VisitorPass> findByStudentIdOrderByCreatedAtDesc(String studentId);
    Optional<VisitorPass> findByPassCode(String passCode);
    Optional<VisitorPass> findByQrToken(String qrToken);
    List<VisitorPass> findAllByOrderByCreatedAtDesc();
}
