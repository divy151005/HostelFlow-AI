package com.hostelflow.repository;

import com.hostelflow.model.LostAndFoundItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface LostAndFoundRepository extends MongoRepository<LostAndFoundItem, String> {
    List<LostAndFoundItem> findAllByOrderByCreatedAtDesc();
    List<LostAndFoundItem> findByStatusOrderByCreatedAtDesc(String status);
}
