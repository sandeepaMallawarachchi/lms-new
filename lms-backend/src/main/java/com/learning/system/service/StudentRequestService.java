package com.learning.system.service;

import com.learning.system.dto.StudentRequestDTO;
import com.learning.system.dto.StudentRequestResponseDTO;
import com.learning.system.entity.Course;
import com.learning.system.entity.StudentProfile;
import com.learning.system.entity.StudentRequest;
import com.learning.system.entity.User;
import com.learning.system.exception.DuplicateResourceException;
import com.learning.system.exception.ResourceNotFoundException;
import com.learning.system.repository.CourseRepository;
import com.learning.system.repository.StudentProfileRepository;
import com.learning.system.repository.StudentRequestRepository;
import com.learning.system.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class StudentRequestService {

    @Autowired
    private StudentRequestRepository studentRequestRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EmailService emailService;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Value("${spring.mail.username}")
    private String adminEmail;

    @Transactional
    public StudentRequestResponseDTO createStudentRequest(StudentRequestDTO requestDTO) {
        // Check if user already exists in the system
        Optional<User> existingUser = userRepository.findByEmail(requestDTO.getEmail());
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            // Check if user has a student profile
            List<StudentProfile> studentProfiles = studentProfileRepository.findByUser(user);
            if (!studentProfiles.isEmpty()) {
                StudentProfile studentProfile = studentProfiles.get(0);
                // Check if any of the requested courses are already assigned
                List<Course> requestedCourses = new ArrayList<>();
                for (Long courseId : requestDTO.getCourseIds()) {
                    Course course = courseRepository.findById(courseId)
                            .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));
                    requestedCourses.add(course);
                    
                    // Check if student is already enrolled in this course
                    if (studentProfile.getCourseEnrollments().stream()
                            .anyMatch(enrollment -> enrollment.getCourse().getId().equals(courseId))) {
                        throw new DuplicateResourceException(
                            "You are already enrolled in course: " + course.getTitle() + 
                            ". Please select different courses."
                        );
                    }
                }
            }
        }
        
        // Validate email for new users
        validateEmail(requestDTO.getEmail());
        
        List<Course> courses = new ArrayList<>();
        
        if (requestDTO.getCourseIds() != null && !requestDTO.getCourseIds().isEmpty()) {
            // Fetch all requested courses
            for (Long courseId : requestDTO.getCourseIds()) {
                Course course = courseRepository.findById(courseId)
                        .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));
                courses.add(course);
            }
            
            // Check for pending requests with the same courses
            List<StudentRequest> pendingRequests = studentRequestRepository.findByEmail(requestDTO.getEmail())
                    .stream()
                    .filter(request -> request.getStatus() == StudentRequest.RequestStatus.PENDING)
                    .collect(Collectors.toList());
            
            for (StudentRequest pendingRequest : pendingRequests) {
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
        }
        
        StudentRequest studentRequest = StudentRequest.builder()
                .fullName(requestDTO.getFullName())
                .whatsAppNumber(requestDTO.getWhatsAppNumber())
                .dateOfBirth(requestDTO.getDateOfBirth())
                .address(requestDTO.getAddress())
                .gender(requestDTO.getGender())
                .knowledge(requestDTO.getKnowledge())
                .email(requestDTO.getEmail())
                .phoneNumber(requestDTO.getPhoneNumber())
                .bio(requestDTO.getBio())
                .courses(courses)
                .status(StudentRequest.RequestStatus.PENDING)
                .requestDate(LocalDateTime.now())
                .build();
        
        StudentRequest savedRequest = studentRequestRepository.save(studentRequest);
        
        // Format course information for emails
        String coursesInfo = getCoursesInfoText(courses);
        
        // Send confirmation email to student
        emailService.sendRequestConfirmationEmail(
            savedRequest.getEmail(),
            savedRequest.getFullName(),
            coursesInfo
        );
        
        // Send notification email to admin
        String studentFullName = savedRequest.getFullName();
        emailService.sendAdminRequestNotificationEmail(
            adminEmail,
            studentFullName,
            savedRequest.getEmail(),
            coursesInfo
        );
        
        return mapToResponseDTO(savedRequest);
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
    
    private void validateEmail(String email) {
        // Check if email is already being used as a username (which means it's registered)
        if (userRepository.existsByUsername(email)) {
            // If user exists, allow them to create a new request
            return;
        }
        
        // Check if email is already registered
        if (userRepository.existsByEmail(email)) {
            // If user exists, allow them to create a new request
            return;
        }
        
        // For new users (not registered), check if there's a pending request
        List<StudentRequest> pendingRequests = studentRequestRepository.findByEmail(email)
                .stream()
                .filter(request -> request.getStatus() == StudentRequest.RequestStatus.PENDING)
                .collect(Collectors.toList());
                
        if (!pendingRequests.isEmpty()) {
            throw new DuplicateResourceException("There is already a pending request with this email. Please wait for approval or contact support.");
        }
    }
    
    public List<StudentRequestResponseDTO> getAllRequests() {
        return studentRequestRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }
    
    public List<StudentRequestResponseDTO> getPendingRequests() {
        return studentRequestRepository.findByStatus(StudentRequest.RequestStatus.PENDING).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }
    
    public StudentRequestResponseDTO getRequestById(Long id) {
        StudentRequest request = studentRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("StudentRequest", "id", id));
        return mapToResponseDTO(request);
    }
    
    @Transactional
    public StudentRequestResponseDTO updateRequestStatus(Long id, StudentRequest.RequestStatus status, User admin) {
        StudentRequest request = studentRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("StudentRequest", "id", id));
        
        request.setStatus(status);
        request.setProcessedDate(LocalDateTime.now());
        request.setProcessedBy(admin);
        
        studentRequestRepository.save(request);
        
        return mapToResponseDTO(request);
    }
    
    private StudentRequestResponseDTO mapToResponseDTO(StudentRequest request) {
        // Check if email has an inactive account
        boolean hasInactiveAccount = false;
        User existingUser = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (existingUser != null && !existingUser.isActive()) {
            hasInactiveAccount = true;
        }
        
        // Create the base DTO
        StudentRequestResponseDTO.StudentRequestResponseDTOBuilder builder = StudentRequestResponseDTO.builder()
                .id(request.getId())
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .address(request.getAddress())
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .knowledge(request.getKnowledge())
                .whatsAppNumber(request.getWhatsAppNumber())
                .bio(request.getBio())
                .status(request.getStatus())
                .requestDate(request.getRequestDate())
                .hasInactiveAccount(hasInactiveAccount);
        
        // Create the response DTO
        StudentRequestResponseDTO responseDTO = builder.build();
        
        // Add course information
        if (request.getCourses() != null && !request.getCourses().isEmpty()) {
            List<StudentRequestResponseDTO.CourseInfo> courseInfos = request.getCourses().stream()
                    .map(course -> StudentRequestResponseDTO.CourseInfo.builder()
                            .courseId(course.getId())
                            .courseName(course.getTitle())
                            .build())
                    .collect(Collectors.toList());
            
            responseDTO.setRequestedCourses(courseInfos);
        }
        
        return responseDTO;
    }
} 