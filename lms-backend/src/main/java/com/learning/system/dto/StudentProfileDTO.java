package com.learning.system.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfileDTO {
    private Long id;
    private Long userId;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String studentId;
    private String department;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate enrollmentDate;
    
    private String address;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateOfBirth;
    
    private String emergencyContactName;
    private String emergencyContactRelation;
    private String emergencyContactPhone;
    private String bio;
    
    @Builder.Default
    private List<EnrolledCourseDTO> enrolledCourses = new ArrayList<>();
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EnrolledCourseDTO {
        private Long id;
        private Long courseId;
        private String courseTitle;
        
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate enrollmentDate;
        
        private String status;
    }
} 