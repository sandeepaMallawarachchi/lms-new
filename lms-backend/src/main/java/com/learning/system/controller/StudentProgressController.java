package com.learning.system.controller;

import com.learning.system.dto.ChapterProgressUpdateRequest;
import com.learning.system.dto.ProgressDTO;
import com.learning.system.dto.StudentOverallProgressDTO;
import com.learning.system.dto.StudentProfileDTO;
import com.learning.system.entity.Course;
import com.learning.system.entity.StudentProfile;
import com.learning.system.entity.User;
import com.learning.system.repository.CourseRepository;
import com.learning.system.repository.StudentProfileRepository;
import com.learning.system.service.CourseProgressService;
import com.learning.system.service.StudentProfileService;
import com.learning.system.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/student/progress")
public class StudentProgressController {

    @Autowired
    private CourseProgressService courseProgressService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private StudentProfileService studentProfileService;
    
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private StudentProfileRepository studentProfileRepository;
    
    /**
     * Mark a chapter as completed
     */
    @PostMapping("/chapters/{chapterId}/complete")
    public ResponseEntity<?> markChapterAsCompleted(@PathVariable Long chapterId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.getUserByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        courseProgressService.markChapterAsCompleted(chapterId, user);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Update a chapter's progress with percentage and time spent
     */
    @PostMapping("/chapters/{chapterId}/progress")
    public ResponseEntity<?> updateChapterProgress(
            @PathVariable Long chapterId,
            @RequestBody ChapterProgressUpdateRequest request) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.getUserByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        courseProgressService.updateChapterProgress(
            chapterId, 
            user, 
            request.getProgressPercentage(), 
            request.getTimeSpentSeconds()
        );
        
        // Return the current progress percentage after update
        int currentProgress = courseProgressService.getChapterProgressPercentage(chapterId, user);
        return ResponseEntity.ok(Map.of("progressPercentage", currentProgress));
    }
    
    /**
     * Get overall progress across all enrolled courses and individual course progress
     */
    @GetMapping("/courses")
    public ResponseEntity<StudentOverallProgressDTO> getAllCoursesProgress() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.getUserByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        try {
            // Get profile DTO which contains enrolled courses
            StudentProfileDTO profileDTO = studentProfileService.getStudentProfileByUserId(user.getId());
            
            // Extract course IDs
            List<Long> courseIds = profileDTO.getEnrolledCourses().stream()
                    .map(StudentProfileDTO.EnrolledCourseDTO::getCourseId)
                    .collect(Collectors.toList());
                    
            // Fetch actual course entities
            List<Course> enrolledCourses = courseRepository.findAllById(courseIds);
            
            // Get progress for each course
            List<ProgressDTO> courseProgressList = courseProgressService.getAllCoursesProgress(enrolledCourses, user);
            
            // Get overall progress across all courses
            ProgressDTO overallProgress = courseProgressService.getOverallProgress(enrolledCourses, user);
            
            StudentOverallProgressDTO response = new StudentOverallProgressDTO(overallProgress, courseProgressList);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error fetching course progress: " + e.getMessage());
        }
    }
    
    /**
     * Get progress for a specific course
     */
    @GetMapping("/courses/{courseId}")
    public ResponseEntity<ProgressDTO> getCourseProgress(@PathVariable Long courseId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.getUserByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        ProgressDTO progress = courseProgressService.getCourseProgress(courseId, user);
        return ResponseEntity.ok(progress);
    }
    
    /**
     * Get overall progress stats across all enrolled courses
     */
    @GetMapping("/overall")
    public ResponseEntity<ProgressDTO> getOverallProgress() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.getUserByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        try {
            // Get profile DTO which contains enrolled courses
            StudentProfileDTO profileDTO = studentProfileService.getStudentProfileByUserId(user.getId());
            
            // Extract course IDs
            List<Long> courseIds = profileDTO.getEnrolledCourses().stream()
                    .map(StudentProfileDTO.EnrolledCourseDTO::getCourseId)
                    .collect(Collectors.toList());
                    
            // Fetch actual course entities
            List<Course> enrolledCourses = courseRepository.findAllById(courseIds);
            
            ProgressDTO overallProgress = courseProgressService.getOverallProgress(enrolledCourses, user);
            return ResponseEntity.ok(overallProgress);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error fetching overall progress: " + e.getMessage());
        }
    }
    
    /**
     * Check if a specific chapter is completed
     */
    @GetMapping("/chapters/{chapterId}/completed")
    public ResponseEntity<Boolean> isChapterCompleted(@PathVariable Long chapterId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.getUserByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        boolean isCompleted = courseProgressService.isChapterCompleted(chapterId, user);
        return ResponseEntity.ok(isCompleted);
    }
    
    /**
     * Get progress percentage for a specific chapter
     */
    @GetMapping("/chapters/{chapterId}/progress")
    public ResponseEntity<Map<String, Object>> getChapterProgress(@PathVariable Long chapterId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.getUserByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        int progressPercentage = courseProgressService.getChapterProgressPercentage(chapterId, user);
        boolean completed = courseProgressService.isChapterCompleted(chapterId, user);
        
        return ResponseEntity.ok(Map.of(
            "progressPercentage", progressPercentage,
            "completed", completed
        ));
    }
} 