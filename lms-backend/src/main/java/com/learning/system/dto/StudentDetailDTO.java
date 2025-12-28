package com.learning.system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Comprehensive DTO representing a student's profile details and course progress
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentDetailDTO {
    // Basic profile information
    private Long id;
    private String studentId;
    private String fullName;
    private String email;
    private String status;
    private String department;
    private LocalDate enrollmentDate;
    
    // Personal information
    private String contactNumber;
    private String address;
    private LocalDate dateOfBirth;
    
    // Bio information
    private String bio;
    private String profileImage;

    // Overall progress information
    private int overallProgressPercentage;
    
    // Enrolled courses with their progress
    @Builder.Default
    private List<CourseProgressDetailDTO> courseProgress = new ArrayList<>();
    
    /**
     * DTO representing detailed course progress information
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CourseProgressDetailDTO {
        private Long courseId;
        private String courseTitle;
        private String courseDescription;
        private LocalDate enrollmentDate;
        private int progressPercentage;
        private int completedChapters;
        private int totalChapters;
        private String finalScore;
        
        @Builder.Default
        private List<ModuleProgressDTO> modules = new ArrayList<>();
    }
    
    /**
     * DTO representing module progress information
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ModuleProgressDTO {
        private Long moduleId;
        private String moduleTitle;
        private int progressPercentage;
        private boolean completed;
        
        @Builder.Default
        private List<ChapterProgressDTO> chapters = new ArrayList<>();
    }
    
    /**
     * DTO representing chapter progress information
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChapterProgressDTO {
        private Long chapterId;
        private String chapterTitle;
        private boolean completed;
    }
} 