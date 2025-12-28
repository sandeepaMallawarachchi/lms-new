package com.learning.system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * DTO for representing students enrolled in a specific course
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentsByCourseDTO {
    
    private Long courseId;
    private String courseTitle;
    private String courseDescription;
    private int totalStudents;
    private int activeStudents;
    private int inactiveStudents;
    private double averageCompletionRate;
    
    @Builder.Default
    private List<StudentEnrollmentDTO> students = new ArrayList<>();
    
    /**
     * DTO for representing a student's enrollment details in a course
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentEnrollmentDTO {
        private Long studentId;
        private String studentName;
        private String email;
        private String profileImage;
        private LocalDate enrollmentDate;
        private int progressPercentage;
        private boolean active;
        private String enrollmentStatus;
    }
    
    /**
     * DTO for representing paginated responses of student enrollments
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PageResponse {
        private Long courseId;
        private String courseTitle;
        private String courseDescription;
        private int totalStudents;
        private int activeStudents;
        private int inactiveStudents;
        private double averageCompletionRate;
        
        private int page;
        private int size;
        private int totalPages;
        private long totalElements;
        
        @Builder.Default
        private List<StudentEnrollmentDTO> content = new ArrayList<>();
    }
}