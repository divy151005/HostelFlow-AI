package com.hostelflow.repository;

import com.hostelflow.model.RoomSwapRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface RoomSwapRequestRepository extends MongoRepository<RoomSwapRequest, String> {
    List<RoomSwapRequest> findByApplicantStudentIdOrTargetStudentIdOrderByCreatedAtDesc(String applicantId, String targetId);
    List<RoomSwapRequest> findAllByOrderByCreatedAtDesc();
}
