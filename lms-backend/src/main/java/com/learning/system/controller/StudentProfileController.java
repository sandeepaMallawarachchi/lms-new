package com.learning.system.controller;

import com.learning.system.dto.StudentProfileDTO;
import com.learning.system.entity.User;
import com.learning.system.service.StudentProfileService;
import com.learning.system.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student-profiles")
public class StudentProfileController {

    @Autowired
    private StudentProfileService studentProfileService;
    
    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<StudentProfileDTO>> getAllStudentProfiles() {
        return ResponseEntity.ok(studentProfileService.getAllStudentProfiles());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<StudentProfileDTO> getStudentProfileById(@PathVariable Long id) {
        return ResponseEntity.ok(studentProfileService.getStudentProfileById(id));
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<StudentProfileDTO> getStudentProfileByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(studentProfileService.getStudentProfileByUserId(userId));
    }
    
    @GetMapping("/username/{username}")
    public ResponseEntity<StudentProfileDTO> getStudentProfileByUsername(@PathVariable String username) {
        return ResponseEntity.ok(studentProfileService.getStudentProfileByUsername(username));
    }
    
    @GetMapping("/current")
    public ResponseEntity<StudentProfileDTO> getCurrentStudentProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        return ResponseEntity.ok(studentProfileService.getStudentProfileByUsername(username));
    }
    
    @PostMapping("/{studentId}/enroll/{courseId}")
    public ResponseEntity<StudentProfileDTO> enrollStudentInCourse(
            @PathVariable Long studentId, 
            @PathVariable Long courseId) {
        return ResponseEntity.ok(studentProfileService.enrollStudentInCourse(studentId, courseId));
    }
    
    @PostMapping("/current/enroll/{courseId}")
    public ResponseEntity<StudentProfileDTO> enrollCurrentStudentInCourse(@PathVariable Long courseId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        StudentProfileDTO studentProfile = studentProfileService.getStudentProfileByUsername(username);
        return ResponseEntity.ok(studentProfileService.enrollStudentInCourse(studentProfile.getId(), courseId));
    }
} 