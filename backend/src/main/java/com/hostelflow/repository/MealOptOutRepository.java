package com.hostelflow.repository;

import com.hostelflow.model.MealOptOut;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.time.LocalDate;
import java.util.List;

public interface MealOptOutRepository extends MongoRepository<MealOptOut, String> {
    List<MealOptOut> findByStudentIdOrderByCreatedAtDesc(String studentId);
    List<MealOptOut> findByOptOutDate(LocalDate date);
    List<MealOptOut> findByOptOutDateAndMealType(LocalDate date, String mealType);
    boolean existsByStudentIdAndOptOutDateAndMealType(String studentId, LocalDate date, String mealType);
}
