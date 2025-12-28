package com.learning.system.controller;

import com.learning.system.dto.StudentCourseRequestDTO;
import com.learning.system.entity.StudentCourseRequest;
import com.learning.system.entity.User;
import com.learning.system.service.StudentCourseRequestService;
import com.learning.system.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student/course-requests")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class StudentCourseRequestController {

    @Autowired
    private StudentCourseRequestService requestService;
    
    @Autowired
    private UserService userService;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentCourseRequest> createRequest(@RequestBody StudentCourseRequestDTO requestDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User student = userService.getUserByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return ResponseEntity.ok(requestService.createRequest(requestDTO, student));
    }
    
    @GetMapping("/my-requests")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<StudentCourseRequest>> getMyRequests() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User student = userService.getUserByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return ResponseEntity.ok(requestService.getStudentRequests(student));
    }
    
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<StudentCourseRequest>> getPendingRequests() {
        return ResponseEntity.ok(requestService.getPendingRequests());
    }
    
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StudentCourseRequest> approveRequest(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User admin = userService.getUserByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return ResponseEntity.ok(requestService.approveRequest(id, admin));
    }
    
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StudentCourseRequest> rejectRequest(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User admin = userService.getUserByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return ResponseEntity.ok(requestService.rejectRequest(id, admin));
    }
} 