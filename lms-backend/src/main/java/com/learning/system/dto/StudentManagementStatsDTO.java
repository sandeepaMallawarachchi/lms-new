package com.learning.system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * DTO for representing student management statistics for the admin dashboard
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentManagementStatsDTO {
    
    /**
     * Total number of students enrolled
     */
    private int totalStudents;
    
    /**
     * Student enrollment count by course
     * List of course enrollment objects
     */
    @Builder.Default
    private List<CourseEnrollmentDTO> enrollmentByCourse = new ArrayList<>();
    
    /**
     * Overall completion rate percentage
     */
    private double completionRate;
    
    /**
     * DTO for course enrollment information
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CourseEnrollmentDTO {
        /**
         * Course ID
         */
        private Long courseId;
        
        /**
         * Course name
         */
        private String courseName;
        
        /**
         * Number of enrolled students
         */
        private int studentCount;
    }
} 