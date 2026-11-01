package com.hostelflow.repository;
import com.hostelflow.model.HostelComplaint;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
public interface HostelComplaintRepository extends MongoRepository<HostelComplaint,String> {
 List<HostelComplaint> findByStudentIdOrderByCreatedAtDesc(String studentId);
 List<HostelComplaint> findAllByOrderByCreatedAtDesc();
 long countByStatus(String status);
}
