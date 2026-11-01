package com.hostelflow.repository;

import com.hostelflow.model.RoomInventory;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;
import java.util.List;

public interface RoomInventoryRepository extends MongoRepository<RoomInventory, String> {
    Optional<RoomInventory> findByStudentId(String studentId);
    Optional<RoomInventory> findByRoomNumber(String roomNumber);
    List<RoomInventory> findAllByOrderByUpdatedAtDesc();
}
