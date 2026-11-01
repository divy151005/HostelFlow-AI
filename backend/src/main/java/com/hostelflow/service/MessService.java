package com.hostelflow.service;

import com.hostelflow.model.FoodFeedback;
import com.hostelflow.model.MessTimetable;
import com.hostelflow.model.User;
import com.hostelflow.repository.FoodFeedbackRepository;
import com.hostelflow.repository.MessTimetableRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class MessService {

    private final MessTimetableRepository timetableRepo;
    private final FoodFeedbackRepository foodFeedbackRepo;

    private static final List<String> DAYS = List.of(
            "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"
    );

    public List<MessTimetable> getWeeklyTimetable() {
        List<MessTimetable> list = timetableRepo.findAll();
        if (list.isEmpty()) {
            initDefaultTimetable();
            list = timetableRepo.findAll();
        }
        // Sort in order of DAYS
        list.sort(Comparator.comparingInt(m -> DAYS.indexOf(m.getDayOfWeek().toUpperCase())));
        return list;
    }

    public MessTimetable updateDayTimetable(String dayOfWeek, MessTimetable input, String updatedBy) {
        String day = dayOfWeek.toUpperCase();
        MessTimetable table = timetableRepo.findByDayOfWeek(day)
                .orElse(MessTimetable.builder().dayOfWeek(day).build());

        if (input.getBreakfast() != null) table.setBreakfast(input.getBreakfast());
        if (input.getLunch() != null) table.setLunch(input.getLunch());
        if (input.getSnacks() != null) table.setSnacks(input.getSnacks());
        if (input.getDinner() != null) table.setDinner(input.getDinner());
        if (input.getSpecialNotes() != null) table.setSpecialNotes(input.getSpecialNotes());

        table.setUpdatedBy(updatedBy);
        table.setUpdatedAt(LocalDateTime.now());
        return timetableRepo.save(table);
    }

    public FoodFeedback submitFeedback(User student, FoodFeedback input) {
        if (input.getFoodQualityRating() < 1 || input.getFoodQualityRating() > 5) {
            input.setFoodQualityRating(3);
        }
        if (input.getHygieneRating() < 1 || input.getHygieneRating() > 5) {
            input.setHygieneRating(3);
        }

        FoodFeedback fb = FoodFeedback.builder()
                .studentId(student.getId())
                .studentName(student.getFullName())
                .rollNumber(student.getRollNumber())
                .roomNumber(student.getRoomNumber())
                .mealType(input.getMealType() == null ? "LUNCH" : input.getMealType().toUpperCase())
                .date(input.getDate() == null || input.getDate().isBlank() ? LocalDateTime.now().toLocalDate().toString() : input.getDate())
                .foodQualityRating(input.getFoodQualityRating())
                .hygieneRating(input.getHygieneRating())
                .comments(input.getComments())
                .attachmentUrl(input.getAttachmentUrl())
                .createdAt(LocalDateTime.now())
                .build();

        return foodFeedbackRepo.save(fb);
    }

    public List<FoodFeedback> getAllFeedback() {
        return foodFeedbackRepo.findAllByOrderByCreatedAtDesc();
    }

    public List<FoodFeedback> getStudentFeedback(String studentId) {
        return foodFeedbackRepo.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    public Map<String, Object> getFeedbackStats() {
        List<FoodFeedback> all = foodFeedbackRepo.findAll();
        double avgQuality = all.stream().mapToInt(FoodFeedback::getFoodQualityRating).average().orElse(0.0);
        double avgHygiene = all.stream().mapToInt(FoodFeedback::getHygieneRating).average().orElse(0.0);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalFeedback", all.size());
        stats.put("avgFoodQuality", Math.round(avgQuality * 10.0) / 10.0);
        stats.put("avgHygiene", Math.round(avgHygiene * 10.0) / 10.0);
        return stats;
    }

    private void initDefaultTimetable() {
        Map<String, String[]> menuDefaults = new LinkedHashMap<>();
        menuDefaults.put("MONDAY", new String[]{"Idli, Sambar, Chutney, Tea/Coffee", "Rice, Dal Tadka, Seasonal Veg, Curd, Salad", "Veg Samosa, Green Chutney, Chai", "Paneer Butter Masala, Roti, Jeera Rice, Gulab Jamun"});
        menuDefaults.put("TUESDAY", new String[]{"Poha, Sev, Boiled Eggs / Banana, Tea", "Rajma, Steamed Rice, Mix Veg, Papad, Raita", "Biscuits, Onion Pakoda, Tea", "Aloo Gobi, Dal Fry, Roti, Rice, Kheer"});
        menuDefaults.put("WEDNESDAY", new String[]{"Aloo Paratha, Butter, Pickle, Dahi, Tea", "Kadai Chicken / Shahi Paneer, Rice, Dal Makhani, Salad", "Bread Pakoda, Sauce, Tea", "Mix Veg Sabzi, Dal Tadka, Chapati, Pulao"});
        menuDefaults.put("THURSDAY", new String[]{"Upma, Coconut Chutney, Sprouts, Coffee", "Chole Bhature / Rice, Boondi Raita, Onion Salad", "Puffed Rice Bhel, Masala Chai", "Egg Curry / Malai Kofta, Roti, Rice, Halwa"});
        menuDefaults.put("FRIDAY", new String[]{"Masala Dosa, Sambar, Tomato Chutney, Tea", "Veg Biryani / Chicken Biryani, Mirchi Ka Salan, Raita", "Corn Chaat, Cookies, Coffee", "Dal Palak, Bhindi Masala, Phulka, Rice"});
        menuDefaults.put("SATURDAY", new String[]{"Puri Bhaji, Halwa, Pickle, Tea", "Kadhi Pakora, Rice, Jeera Aloo, Papad, Salad", "Veg Cutlet, Mint Chutney, Chai", "Matar Paneer, Dal Fry, Tawa Roti, Rice, Ice Cream"});
        menuDefaults.put("SUNDAY", new String[]{"Chole Kulche, Butter, Lassi / Tea", "Special Sunday Feast: Paneer/Chicken, Naan, Pulao, Raita", "Pasta / French Fries, Coffee", "Dal Makhani, Mix Veg, Roti, Steamed Rice, Custard"});

        for (Map.Entry<String, String[]> entry : menuDefaults.entrySet()) {
            String day = entry.getKey();
            String[] m = entry.getValue();
            MessTimetable t = MessTimetable.builder()
                    .dayOfWeek(day)
                    .breakfast(MessTimetable.MealInfo.builder().items(m[0]).timing("07:30 - 09:30").category("Veg").build())
                    .lunch(MessTimetable.MealInfo.builder().items(m[1]).timing("12:30 - 14:30").category("Veg / Non-Veg").build())
                    .snacks(MessTimetable.MealInfo.builder().items(m[2]).timing("17:00 - 18:00").category("Snacks").build())
                    .dinner(MessTimetable.MealInfo.builder().items(m[3]).timing("19:30 - 21:30").category("Veg / Non-Veg").build())
                    .specialNotes("Clean and hygienic mess assured. Fresh filter water provided.")
                    .updatedBy("Hostel Mess Committee")
                    .updatedAt(LocalDateTime.now())
                    .build();
            timetableRepo.save(t);
        }
    }
}
