package com.learning.system.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentCourseRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    private User student;
    
    @ManyToMany
    @JoinTable(
        name = "student_course_request_courses",
        joinColumns = @JoinColumn(name = "request_id"),
        inverseJoinColumns = @JoinColumn(name = "course_id")
    )
    @Builder.Default
    private List<Course> courses = new ArrayList<>();
    
    private String reason;
    
    @Enumerated(EnumType.STRING)
    private RequestStatus status;
    
    private LocalDateTime requestDate;
    private LocalDateTime processedDate;
    
    @ManyToOne
    private User processedBy;
    
    public enum RequestStatus {
        PENDING,
        APPROVED,
        REJECTED
    }
} 