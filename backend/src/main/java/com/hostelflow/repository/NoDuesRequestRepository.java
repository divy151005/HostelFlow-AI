package com.hostelflow.repository;

import com.hostelflow.model.NoDuesRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;
import java.util.List;

public interface NoDuesRequestRepository extends MongoRepository<NoDuesRequest, String> {
    Optional<NoDuesRequest> findByStudentId(String studentId);
    List<NoDuesRequest> findAllByOrderByCreatedAtDesc();
}
