package com.hostelflow.repository;

import com.hostelflow.model.FoodFeedback;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface FoodFeedbackRepository extends MongoRepository<FoodFeedback, String> {
    List<FoodFeedback> findByStudentIdOrderByCreatedAtDesc(String studentId);
    List<FoodFeedback> findAllByOrderByCreatedAtDesc();
    List<FoodFeedback> findByDate(String date);
}
