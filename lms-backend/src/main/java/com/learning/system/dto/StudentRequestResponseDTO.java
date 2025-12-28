package com.learning.system.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.learning.system.entity.StudentRequest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentRequestResponseDTO {
    private Long id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String whatsAppNumber;
    private String address;
    private String gender;
    private String knowledge;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateOfBirth;

    private String bio;
//    private String department;
    
    @Builder.Default
    private List<CourseInfo> requestedCourses = new ArrayList<>();
    
    private StudentRequest.RequestStatus status;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime requestDate;
    
    private boolean hasInactiveAccount;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CourseInfo {
        private Long courseId;
        private String courseName;
    }
} 