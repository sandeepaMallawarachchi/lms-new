package com.learning.system.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String fullName;
    private String email;
    private String phoneNumber;
    private String whatsAppNumber;
    private String address;
    private LocalDate dateOfBirth;
    private String gender;
    private String knowledge;
    private String bio;
    private String department;
    
    @ManyToMany
    @JoinTable(
        name = "student_request_courses",
        joinColumns = @JoinColumn(name = "request_id"),
        inverseJoinColumns = @JoinColumn(name = "course_id")
    )
    @Builder.Default
    private List<Course> courses = new ArrayList<>();
    
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