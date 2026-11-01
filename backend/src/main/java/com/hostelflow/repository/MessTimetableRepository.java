package com.hostelflow.repository;

import com.hostelflow.model.MessTimetable;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface MessTimetableRepository extends MongoRepository<MessTimetable, String> {
    Optional<MessTimetable> findByDayOfWeek(String dayOfWeek);
}
