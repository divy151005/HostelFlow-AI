package com.hostelflow.repository;

import com.hostelflow.model.FeeRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface FeeRecordRepository extends MongoRepository<FeeRecord, String> {
    List<FeeRecord> findByStudentIdOrderByCreatedAtDesc(String studentId);
    List<FeeRecord> findAllByOrderByCreatedAtDesc();
    List<FeeRecord> findByStatus(String status);
}
