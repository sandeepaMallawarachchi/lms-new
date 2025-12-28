package com.learning.system.controller;

import com.learning.system.dto.StudentProfileDTO;
import com.learning.system.service.StudentProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.learning.system.dto.StudentManagementStatsDTO;
import com.learning.system.dto.StudentsByCourseDTO;
import com.learning.system.service.AdminDashboardService;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/admin/dashboard")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    @Autowired
    private AdminDashboardService adminDashboardService;

    @Autowired
    private StudentProfileService studentProfileService;
    
    /**
     * Get student management statistics for the admin dashboard
     * Includes total student count, enrollment by course, and completion rate
     * 
     * @param activeOnly Whether to return statistics for active users (true) or inactive users (false)
     * @return StudentManagementStatsDTO containing statistics for the specified user type
     */
    @GetMapping("/student-stats")
    public ResponseEntity<StudentManagementStatsDTO> getStudentManagementStats(
            @RequestParam(defaultValue = "true") boolean activeOnly) {
        return ResponseEntity.ok(adminDashboardService.getStudentManagementStats(activeOnly));
    }
    
    /**
     * Get students enrolled in a specific course with pagination
     * 
     * @param courseId The course ID to get students for
     * @param page The page number (0-based)
     * @param size The page size
     * @return Paginated list of students with their enrollment details and progress
     */
    @GetMapping("/students-by-course/{courseId}")
    public ResponseEntity<StudentsByCourseDTO> getStudentsByCourse(
            @PathVariable Long courseId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(adminDashboardService.getStudentsByCourse(courseId, page, size));
    }
    
    /**
     * Get all students enrolled in a specific course (no pagination)
     * 
     * @param courseId The course ID to get students for
     * @param activeOnly Whether to return only active users (true) or all users (false)
     * @return List of all students with their enrollment details and progress
     */
    @GetMapping("/students-by-course/{courseId}/all")
    public ResponseEntity<StudentsByCourseDTO> getAllStudentsByCourse(
            @PathVariable Long courseId,
            @RequestParam(defaultValue = "true") boolean activeOnly) {
        return ResponseEntity.ok(adminDashboardService.getStudentsByCourse(courseId, 0, Integer.MAX_VALUE));
    }

    /**
     * Toggle the active status of a user by their student profile ID
     * Only accessible by admin users
     * 
     * @param studentProfileId The ID of the student profile
     * @return ResponseEntity with the new active status
     */
    @PutMapping("/toggle-user-status/{studentProfileId}")
    public ResponseEntity<Map<String, Object>> toggleUserActiveStatus(
            @PathVariable Long studentProfileId) {
        boolean isActive = adminDashboardService.toggleUserActiveStatus(studentProfileId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", isActive ? "User activated successfully" : "User deactivated successfully");
        response.put("isActive", isActive);
        
        return ResponseEntity.ok(response);
    }
    @PutMapping("/toggle-enrollment-status/{studentProfileId}/{courseId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> toggleEnrollmentStatus(
            @PathVariable Long studentProfileId,
            @PathVariable Long courseId) {
        try {
            StudentProfileDTO updatedProfile = studentProfileService.toggleEnrollmentStatus(studentProfileId, courseId);
            return ResponseEntity.ok(updatedProfile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
} 