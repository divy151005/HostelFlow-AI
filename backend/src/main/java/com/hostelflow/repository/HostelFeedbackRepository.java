package com.hostelflow.repository;

import com.hostelflow.model.HostelFeedback;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface HostelFeedbackRepository extends MongoRepository<HostelFeedback, String> {
    boolean existsByStudentIdAndWeekStart(String studentId, String weekStart);
    List<HostelFeedback> findByStudentIdOrderByCreatedAtDesc(String studentId);
    List<HostelFeedback> findAllByOrderByCreatedAtDesc();
}
