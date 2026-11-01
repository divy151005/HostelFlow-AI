package com.hostelflow.repository;

import com.hostelflow.model.MealPoll;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface MealPollRepository extends MongoRepository<MealPoll, String> {
    List<MealPoll> findByActiveTrueOrderByCreatedAtDesc();
    List<MealPoll> findAllByOrderByCreatedAtDesc();
}
