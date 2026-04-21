package com.hostelflow.repository;

import com.hostelflow.model.LeaveRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface LeaveRequestRepository extends MongoRepository<LeaveRequest, String> {
    Page<LeaveRequest> findByStudentId(String studentId, Pageable pageable);
    List<LeaveRequest> findByStudentId(String studentId);
    Page<LeaveRequest> findByStatus(LeaveRequest.Status status, Pageable pageable);
    List<LeaveRequest> findByStatus(LeaveRequest.Status status);
    Optional<LeaveRequest> findByQrToken(String qrToken);

    @Query("{'status': {$in: ['APPROVED']}, 'qrScannedOut': true, 'qrScannedIn': false, 'expectedReturn': {$lt: ?0}}")
    List<LeaveRequest> findOverdueRequests(LocalDateTime now);

    @Query("{'studentId': ?0, 'status': {$in: ['APPROVED', 'COMPLETED', 'LATE']}}")
    List<LeaveRequest> findCompletedByStudent(String studentId);

    @Query("{'status': {$in: ['PENDING_WARDEN', 'PENDING_MENTOR', 'PENDING_PARENT']}}")
    Page<LeaveRequest> findAllPending(Pageable pageable);

    long countByStudentIdAndIsLate(String studentId, boolean isLate);

    @Query("{'createdAt': {$gte: ?0, $lte: ?1}}")
    List<LeaveRequest> findByDateRange(LocalDateTime from, LocalDateTime to);

    List<LeaveRequest> findByStudentIdAndStatus(String studentId, LeaveRequest.Status status);

    @Query("{'status': 'APPROVED', 'qrScannedOut': true, 'qrScannedIn': false}")
    List<LeaveRequest> findCurrentlyOut();
}
