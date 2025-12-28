package com.learning.system.controller;

import com.learning.system.dto.ProgressDTO;
import com.learning.system.dto.StudentDetailDTO;
import com.learning.system.dto.StudentOverallProgressDTO;
import com.learning.system.dto.StudentProfileDTO;
import com.learning.system.dto.StudentProfileUpdateRequest;
import com.learning.system.entity.Course;
import com.learning.system.entity.User;
import com.learning.system.repository.CourseRepository;
import com.learning.system.service.CourseProgressService;
import com.learning.system.service.StudentDetailService;
import com.learning.system.service.StudentProfileService;
import com.learning.system.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/student-details")
public class StudentDetailController {

    @Autowired
    private StudentDetailService studentDetailService;
    
    @Autowired
    private StudentProfileService studentProfileService;
    
    @Autowired
    private CourseProgressService courseProgressService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private CourseRepository courseRepository;
    
    /**
     * Get current logged-in student's details and progress
     */
    @GetMapping("/current")
    public ResponseEntity<StudentDetailDTO> getCurrentStudentDetail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.getUserByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        StudentDetailDTO studentDetail = studentDetailService.getStudentDetailByUserId(user.getId());
        return ResponseEntity.ok(studentDetail);
    }
    
    /**
     * Update current logged-in student's profile information
     */
    @PutMapping("/current")
    public ResponseEntity<StudentDetailDTO> updateCurrentStudentProfile(
            @RequestBody StudentProfileUpdateRequest updateRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.getUserByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        StudentDetailDTO updatedProfile = studentDetailService.updateStudentProfile(user.getId(), updateRequest);
        return ResponseEntity.ok(updatedProfile);
    }
    
    /**
     * Get student details by student ID
     */
    @GetMapping("/{studentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StudentDetailDTO> getStudentDetailById(@PathVariable Long studentId) {
        StudentDetailDTO studentDetail = studentDetailService.getStudentDetailById(studentId);
        return ResponseEntity.ok(studentDetail);
    }
    
    /**
     * Update student profile by student ID (admin only)
     */
    @PutMapping("/{studentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StudentDetailDTO> updateStudentProfile(
            @PathVariable Long studentId,
            @RequestBody StudentProfileUpdateRequest updateRequest) {
        
        StudentDetailDTO updatedProfile = studentDetailService.updateStudentProfile(studentId, updateRequest);
        return ResponseEntity.ok(updatedProfile);
    }
    
    /**
     * Get course detail progress for a specific student and course
     */
    @GetMapping("/{studentId}/courses/{courseId}")
    @PreAuthorize("hasRole('ADMIN') or @securityService.isCurrentUser(#studentId)")
    public ResponseEntity<ProgressDTO> getStudentCourseDetail(
            @PathVariable Long studentId, 
            @PathVariable Long courseId) {
        
        ProgressDTO courseProgress = studentDetailService.getStudentCourseDetail(studentId, courseId);
        return ResponseEntity.ok(courseProgress);
    }
    
    /**
     * Get current student's course detail progress
     */
    @GetMapping("/current/courses/{courseId}")
    public ResponseEntity<ProgressDTO> getCurrentStudentCourseDetail(@PathVariable Long courseId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.getUserByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        StudentProfileDTO profileDTO = studentProfileService.getStudentProfileByUserId(user.getId());
        ProgressDTO courseProgress = studentDetailService.getStudentCourseDetail(profileDTO.getId(), courseId);
        return ResponseEntity.ok(courseProgress);
    }
} 