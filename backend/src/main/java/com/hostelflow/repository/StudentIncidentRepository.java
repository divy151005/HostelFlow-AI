package com.hostelflow.repository;

import com.hostelflow.model.StudentIncident;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface StudentIncidentRepository extends MongoRepository<StudentIncident, String> {
    List<StudentIncident> findAllByOrderByCreatedAtDesc();
    List<StudentIncident> findByStudentIdOrderByCreatedAtDesc(String studentId);
    List<StudentIncident> findByStatusOrderByCreatedAtDesc(StudentIncident.Status status);
}
