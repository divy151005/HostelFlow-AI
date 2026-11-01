package com.hostelflow.service;

import com.hostelflow.model.LeaveRequest;
import com.hostelflow.model.MealOptOut;
import com.hostelflow.model.MealPoll;
import com.hostelflow.model.User;
import com.hostelflow.repository.LeaveRequestRepository;
import com.hostelflow.repository.MealOptOutRepository;
import com.hostelflow.repository.MealPollRepository;
import com.hostelflow.repository.UserRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class MessExtensionService {

    private final MealOptOutRepository optOutRepo;
    private final MealPollRepository pollRepo;
    private final UserRepository userRepo;
    private final LeaveRequestRepository leaveRepo;

    @Data
    @Builder
    public static class KitchenHeadcountSummary {
        private LocalDate date;
        private long totalHostelStudents;
        private long onApprovedLeave;
        private Map<String, Long> optOutCounts; // BREAKFAST, LUNCH, SNACKS, DINNER
        private Map<String, Long> expectedDiners; // mealType -> estimated plates
        private double estimatedFoodSavedKg;
    }

    public MealOptOut optOutMeal(String studentId, LocalDate date, String mealType, String reason) {
        if (optOutRepo.existsByStudentIdAndOptOutDateAndMealType(studentId, date, mealType)) {
            throw new RuntimeException("You have already opted out of " + mealType + " on " + date);
        }
        User student = userRepo.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        MealOptOut optOut = MealOptOut.builder()
                .studentId(studentId)
                .studentName(student.getFullName())
                .rollNumber(student.getRollNumber())
                .roomNumber(student.getRoomNumber())
                .optOutDate(date)
                .mealType(mealType.toUpperCase())
                .reason(reason != null ? reason : "Personal outing / meal skipped")
                .rebateAmount(50.0) // Flat ₹50 rebate per skipped meal
                .build();

        return optOutRepo.save(optOut);
    }

    public List<MealOptOut> getStudentOptOuts(String studentId) {
        return optOutRepo.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    public double getTotalRebate(String studentId) {
        return optOutRepo.findByStudentIdOrderByCreatedAtDesc(studentId)
                .stream().mapToDouble(MealOptOut::getRebateAmount).sum();
    }

    public KitchenHeadcountSummary getKitchenHeadcount(LocalDate date) {
        long totalStudents = userRepo.countByRole(User.Role.STUDENT);
        
        // Count active leaves on that date
        List<LeaveRequest> leaves = leaveRepo.findByStatus(LeaveRequest.Status.APPROVED);
        long onLeave = leaves.stream()
                .filter(l -> l.getFromDate() != null && l.getToDate() != null &&
                        !date.isBefore(l.getFromDate().toLocalDate()) &&
                        !date.isAfter(l.getToDate().toLocalDate()))
                .count();

        List<MealOptOut> optOuts = optOutRepo.findByOptOutDate(date);
        Map<String, Long> optOutCounts = new HashMap<>();
        for (String m : List.of("BREAKFAST", "LUNCH", "SNACKS", "DINNER")) {
            long count = optOuts.stream().filter(o -> m.equalsIgnoreCase(o.getMealType())).count();
            optOutCounts.put(m, count);
        }

        Map<String, Long> expectedDiners = new HashMap<>();
        long totalSkipped = 0;
        for (String m : List.of("BREAKFAST", "LUNCH", "SNACKS", "DINNER")) {
            long skipped = optOutCounts.get(m);
            totalSkipped += skipped;
            long diners = Math.max(0, totalStudents - onLeave - skipped);
            expectedDiners.put(m, diners);
        }

        // Est. 0.45 kg saved per skipped meal
        double foodSavedKg = (totalSkipped + onLeave * 3) * 0.45;

        return KitchenHeadcountSummary.builder()
                .date(date)
                .totalHostelStudents(totalStudents)
                .onApprovedLeave(onLeave)
                .optOutCounts(optOutCounts)
                .expectedDiners(expectedDiners)
                .estimatedFoodSavedKg(Math.round(foodSavedKg * 10.0) / 10.0)
                .build();
    }

    public MealPoll createPoll(MealPoll poll) {
        if (poll.getVoteCounts() == null) {
            poll.setVoteCounts(new HashMap<>());
        }
        for (String opt : poll.getOptions()) {
            poll.getVoteCounts().putIfAbsent(opt, 0);
        }
        return pollRepo.save(poll);
    }

    public List<MealPoll> getActivePolls() {
        return pollRepo.findByActiveTrueOrderByCreatedAtDesc();
    }

    public MealPoll votePoll(String pollId, String studentId, String option) {
        MealPoll poll = pollRepo.findById(pollId)
                .orElseThrow(() -> new RuntimeException("Poll not found"));

        if (!poll.isActive()) {
            throw new RuntimeException("This poll is closed");
        }
        if (poll.getVotedStudentIds().contains(studentId)) {
            throw new RuntimeException("You have already voted in this poll");
        }

        poll.getVotedStudentIds().add(studentId);
        int current = poll.getVoteCounts().getOrDefault(option, 0);
        poll.getVoteCounts().put(option, current + 1);

        return pollRepo.save(poll);
    }
}
