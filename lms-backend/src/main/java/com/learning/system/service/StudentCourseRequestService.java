package com.learning.system.service;

import com.learning.system.dto.StudentCourseRequestDTO;
import com.learning.system.entity.Course;
import com.learning.system.entity.StudentCourseRequest;
import com.learning.system.entity.User;
import com.learning.system.exception.DuplicateResourceException;
import com.learning.system.exception.ResourceNotFoundException;
import com.learning.system.repository.CourseRepository;
import com.learning.system.repository.StudentCourseRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentCourseRequestService {

    @Autowired
    private StudentCourseRequestRepository requestRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private EmailService emailService;

    @Transactional
    public StudentCourseRequest createRequest(StudentCourseRequestDTO requestDTO, User student) {
        // Validate courses
        List<Course> courses = new ArrayList<>();
        for (Long courseId : requestDTO.getCourseIds()) {
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));
            courses.add(course);
        }
        
        // Check if student has any pending requests for the same courses
        List<StudentCourseRequest> pendingRequests = requestRepository.findByStudentAndStatus(
            student, 
            StudentCourseRequest.RequestStatus.PENDING
        );
        
        // Check for duplicate course requests
        for (StudentCourseRequest pendingRequest : pendingRequests) {
            for (Course course : courses) {
                if (pendingRequest.getCourses().stream()
                        .anyMatch(c -> c.getId().equals(course.getId()))) {
                    throw new DuplicateResourceException(
                        "You already have a pending request for course: " + course.getTitle() + 
                        ". Please wait for the current request to be processed."
                    );
                }
            }
        }
        
        // Create request
        StudentCourseRequest request = StudentCourseRequest.builder()
                .student(student)
                .courses(courses)
                .reason(requestDTO.getReason())
                .status(StudentCourseRequest.RequestStatus.PENDING)
                .requestDate(LocalDateTime.now())
                .build();
        
        StudentCourseRequest savedRequest = requestRepository.save(request);
        
        // Send notification email to admin
        String coursesInfo = getCoursesInfoText(courses);
        emailService.sendCourseRequestNotificationEmail(
            student.getEmail(),
            student.getFirstName() + " " + student.getLastName(),
            coursesInfo,
            requestDTO.getReason()
        );
        
        return savedRequest;
    }
    
    private String getCoursesInfoText(List<Course> courses) {
        if (courses == null || courses.isEmpty()) {
            return "No courses";
        }
        
        StringBuilder info = new StringBuilder();
        for (int i = 0; i < courses.size(); i++) {
            Course course = courses.get(i);
            info.append(i + 1).append(". ").append(course.getTitle())
                .append("\n   Description: ").append(course.getDescription())
                .append("\n");
        }
        
        return info.toString();
    }
    
    public List<StudentCourseRequest> getStudentRequests(User student) {
        return requestRepository.findByStudent(student);
    }
    
    public List<StudentCourseRequest> getPendingRequests() {
        return requestRepository.findByStatus(StudentCourseRequest.RequestStatus.PENDING);
    }
    
    @Transactional
    public StudentCourseRequest approveRequest(Long requestId, User admin) {
        StudentCourseRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentCourseRequest", "id", requestId));
        
        request.setStatus(StudentCourseRequest.RequestStatus.APPROVED);
        request.setProcessedDate(LocalDateTime.now());
        request.setProcessedBy(admin);
        
        // Send approval email to student
        String coursesInfo = getCoursesInfoText(request.getCourses());
        emailService.sendCourseRequestApprovalEmail(
            request.getStudent().getEmail(),
            request.getStudent().getFirstName() + " " + request.getStudent().getLastName(),
            coursesInfo
        );
        
        return requestRepository.save(request);
    }
    
    @Transactional
    public StudentCourseRequest rejectRequest(Long requestId, User admin) {
        StudentCourseRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentCourseRequest", "id", requestId));
        
        request.setStatus(StudentCourseRequest.RequestStatus.REJECTED);
        request.setProcessedDate(LocalDateTime.now());
        request.setProcessedBy(admin);
        
        // Send rejection email to student
        String coursesInfo = getCoursesInfoText(request.getCourses());
        emailService.sendCourseRequestRejectionEmail(
            request.getStudent().getEmail(),
            request.getStudent().getFirstName() + " " + request.getStudent().getLastName(),
            coursesInfo
        );
        
        return requestRepository.save(request);
    }
} 