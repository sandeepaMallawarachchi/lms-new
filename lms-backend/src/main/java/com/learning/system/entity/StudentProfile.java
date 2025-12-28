package com.learning.system.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
    private String gender;
    private String studentId;
    private String knowledge;
    private String whatsAppNumber;
    private String department;
    private LocalDate enrollmentDate;
    private String address;
    private LocalDate dateOfBirth;
    private String emergencyContactName;
    private String emergencyContactRelation;
    private String emergencyContactPhone;
    private String profileImage;
    private String bio;
    
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<StudentCourseEnrollment> courseEnrollments = new ArrayList<>();
    
    public void addCourseEnrollment(Course course, LocalDate enrollmentDate) {
        StudentCourseEnrollment enrollment = StudentCourseEnrollment.builder()
                .student(this)
                .course(course)
                .enrollmentDate(enrollmentDate)
                .status(StudentCourseEnrollment.EnrollmentStatus.ACTIVE)
                .build();
        courseEnrollments.add(enrollment);
    }
} 