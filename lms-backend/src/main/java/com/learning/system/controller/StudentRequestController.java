package com.learning.system.controller;

import com.learning.system.dto.CourseApprovalDTO;
import com.learning.system.dto.StudentProfileDTO;
import com.learning.system.dto.StudentRequestDTO;
import com.learning.system.dto.StudentRequestResponseDTO;
import com.learning.system.entity.StudentRequest;
import com.learning.system.entity.User;
import com.learning.system.service.StudentProfileService;
import com.learning.system.service.StudentRequestService;
import com.learning.system.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/student-requests")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class StudentRequestController {

    @Autowired
    private StudentRequestService studentRequestService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private StudentProfileService studentProfileService;

    @PostMapping
    public ResponseEntity<StudentRequestResponseDTO> createStudentRequest(@RequestBody StudentRequestDTO requestDTO) {
        return ResponseEntity.ok(studentRequestService.createStudentRequest(requestDTO));
    }
    
    @GetMapping
    public ResponseEntity<List<StudentRequestResponseDTO>> getAllRequests() {
        return ResponseEntity.ok(studentRequestService.getAllRequests());
    }
    
    @GetMapping("/pending")
    public ResponseEntity<List<StudentRequestResponseDTO>> getPendingRequests() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        System.out.println("User: " + username);
        System.out.println("Authorities: " + authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList()));
        
        return ResponseEntity.ok(studentRequestService.getPendingRequests());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<StudentRequestResponseDTO> getRequestById(@PathVariable Long id) {
        return ResponseEntity.ok(studentRequestService.getRequestById(id));
    }
    
    @PostMapping("/{id}/approve")
    public ResponseEntity<StudentProfileDTO> approveRequest(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        System.out.println("User: " + username);
        System.out.println("Authorities: " + authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList()));
        
        User admin = userService.getUserByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // First update request status
        studentRequestService.updateRequestStatus(id, StudentRequest.RequestStatus.APPROVED, admin);
        
        // Then create student profile
        StudentProfileDTO profile = studentProfileService.approveStudentRequest(id, admin);
        
        return ResponseEntity.ok(profile);
    }
    
    @PostMapping("/{id}/approve-selected")
    public ResponseEntity<StudentProfileDTO> approveSelectedCourses(
            @PathVariable Long id,
            @RequestBody CourseApprovalDTO approvalDTO) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User admin = userService.getUserByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Extract the course IDs list from the DTO
        List<Long> courseIds = approvalDTO.getCourseIds();
        
        // Approve only the selected courses
        StudentProfileDTO profile = studentProfileService.approveSelectedCourses(id, courseIds, admin);
        
        return ResponseEntity.ok(profile);
    }
    
    @PostMapping("/{id}/reject")
    public ResponseEntity<StudentRequestResponseDTO> rejectRequest(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User admin = userService.getUserByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return ResponseEntity.ok(studentRequestService.updateRequestStatus(id, StudentRequest.RequestStatus.REJECTED, admin));
    }
} 