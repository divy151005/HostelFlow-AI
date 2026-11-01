package com.hostelflow.repository;

import com.hostelflow.model.MaintenanceTask;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface MaintenanceTaskRepository extends MongoRepository<MaintenanceTask, String> {
    List<MaintenanceTask> findAllByOrderByCreatedAtDesc();
    List<MaintenanceTask> findByStatusOrderByCreatedAtDesc(String status);
    List<MaintenanceTask> findByRoomNumberOrderByCreatedAtDesc(String roomNumber);
    long countByStatus(String status);
}
