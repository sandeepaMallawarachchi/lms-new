package com.learning.system.service;

import com.learning.system.dto.CourseApprovalDTO;
import com.learning.system.dto.RegisterRequest;
import com.learning.system.dto.StudentProfileDTO;
import com.learning.system.entity.*;
import com.learning.system.exception.ResourceNotFoundException;
import com.learning.system.repository.CourseRepository;
import com.learning.system.repository.RoleRepository;
import com.learning.system.repository.StudentCourseEnrollmentRepository;
import com.learning.system.repository.StudentProfileRepository;
import com.learning.system.repository.StudentRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class StudentProfileService {

    @Autowired
    private StudentProfileRepository studentProfileRepository;
    
    @Autowired
    private StudentRequestRepository studentRequestRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private StudentCourseEnrollmentRepository enrollmentRepository;
    
    @Autowired
    private AuthenticationService authenticationService;
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private EmailService emailService;
    
    private static final String STUDENT_ID_PREFIX = "ST";
    private static final String STUDENT_ROLE = "ROLE_STUDENT";
    private static final String DEFAULT_PASSWORD = "Password123";

    @Transactional
    public StudentProfileDTO approveStudentRequest(Long requestId, User admin) {
        StudentRequest request = studentRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Student request not found with id: " + requestId));
        
        // Check if there's already a profile for this email
        Optional<User> existingUser = authenticationService.findUserByEmail(request.getEmail());
        StudentProfileDTO profileDTO;
        boolean isNewUser = false;
        String username = request.getEmail();
        String password = DEFAULT_PASSWORD;
        
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            // Check if there's a profile for this user
            List<StudentProfile> existingProfiles = studentProfileRepository.findByUser(user);
            if (!existingProfiles.isEmpty()) {
                StudentProfile profile = existingProfiles.get(0);
                
                // Add all the requested courses to existing profile
                if (request.getCourses() != null && !request.getCourses().isEmpty()) {
                    for (Course course : request.getCourses()) {
                        if (!isEnrolledInCourse(profile, course)) {
                            profile.addCourseEnrollment(course, LocalDate.now());
                        }
                    }
                    studentProfileRepository.save(profile);
                }
                
                profileDTO = mapToDTO(profile);
                
                // Send enrollment confirmation email for existing user
                String coursesInfo = getCoursesInfoText(request.getCourses());
                emailService.sendEnrollmentConfirmationEmail(
                    request.getEmail(), 
                    request.getFullName(),
                    coursesInfo
                );
            } else {
                // User exists but no profile, create profile
                profileDTO = createProfileForUser(user, request);
                
                // Send enrollment confirmation email
                String coursesInfo = getCoursesInfoText(request.getCourses());
                emailService.sendEnrollmentConfirmationEmail(
                    request.getEmail(), 
                    request.getFullName(),
                    coursesInfo
                );
            }
        } else {
            // Create a new user account - use email as username
            RegisterRequest registerRequest = RegisterRequest.builder()
                    .username(username)  // Use email as username
                    .password(password) // Default password, should be changed by student
                    .email(request.getEmail())
                    .firstName(request.getFullName().split(" ")[0])
//                    .lastName(request.getFullName().split(" ")[1])
                    .contactNumber(request.getPhoneNumber())
                    .active(true)
                    .role(STUDENT_ROLE)
                    .build();
            
            var authResponse = authenticationService.register(registerRequest);
            var user = authenticationService.getUserFromToken(authResponse.getToken());
            
            profileDTO = createProfileForUser(user, request);
            isNewUser = true;
            
            // Get formatted course information for email
            String coursesHtml = getCoursesInfoHtml(request.getCourses());
            
            // Send HTML approval email for new user
            emailService.sendApprovalNotificationHtml(
                request.getEmail(),
                request.getFullName(),
                coursesHtml,
                username,
                password
            );
        }
        
        // Update request status
        request.setStatus(StudentRequest.RequestStatus.APPROVED);
        request.setProcessedDate(LocalDate.now().atStartOfDay());
        request.setProcessedBy(admin);
        studentRequestRepository.save(request);
        
        return profileDTO;
    }
    
    @Transactional
    public StudentProfileDTO approveSelectedCourses(Long requestId, List<Long> courseIds, User admin) {
        StudentRequest request = studentRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Student request not found with id: " + requestId));
        
        // Create a modified request with only the approved courses
        StudentRequest modifiedRequest = new StudentRequest();
        modifiedRequest.setFullName(request.getFullName());
        modifiedRequest.setEmail(request.getEmail());
        modifiedRequest.setPhoneNumber(request.getPhoneNumber());
        modifiedRequest.setAddress(request.getAddress());
        modifiedRequest.setDateOfBirth(request.getDateOfBirth());
        modifiedRequest.setGender(request.getGender());
        modifiedRequest.setKnowledge(request.getKnowledge());

        modifiedRequest.setBio(request.getBio());
        modifiedRequest.setDepartment(request.getDepartment());
        
        List<Course> approvedCourses = courseRepository.findAllById(courseIds);
        modifiedRequest.setCourses(approvedCourses);
        
        // Check if there's already a profile for this email
        Optional<User> existingUser = authenticationService.findUserByEmail(request.getEmail());
        StudentProfileDTO profileDTO;
        boolean isNewUser = false;
        String username = request.getEmail();
        String password = DEFAULT_PASSWORD;
        
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            // Check if there's a profile for this user
            List<StudentProfile> existingProfiles = studentProfileRepository.findByUser(user);
            if (!existingProfiles.isEmpty()) {
                StudentProfile profile = existingProfiles.get(0);
                
                // Add only the approved courses to existing profile
                for (Course course : approvedCourses) {
                    if (!isEnrolledInCourse(profile, course)) {
                        profile.addCourseEnrollment(course, LocalDate.now());
                    }
                }
                studentProfileRepository.save(profile);
                
                // Update the request status
                request.setStatus(StudentRequest.RequestStatus.APPROVED);
                request.setProcessedDate(LocalDate.now().atStartOfDay());
                request.setProcessedBy(admin);
                studentRequestRepository.save(request);
                
                profileDTO = mapToDTO(profile);
                
                // Send enrollment confirmation email for existing user
                String coursesInfo = getCoursesInfoText(approvedCourses);
                emailService.sendEnrollmentConfirmationEmail(
                    request.getEmail(), 
                    request.getFullName(),
                    coursesInfo
                );
            } else {
                // User exists but no profile, create profile with approved courses
                profileDTO = createProfileForUser(user, modifiedRequest);
                
                // Update the request status
                request.setStatus(StudentRequest.RequestStatus.APPROVED);
                request.setProcessedDate(LocalDate.now().atStartOfDay());
                request.setProcessedBy(admin);
                studentRequestRepository.save(request);
                
                // Send enrollment confirmation email
                String coursesInfo = getCoursesInfoText(approvedCourses);
                emailService.sendEnrollmentConfirmationEmail(
                    request.getEmail(), 
                    request.getFullName(),
                    coursesInfo
                );
            }
        } else {
            // Create a new user account - use email as username
            RegisterRequest registerRequest = RegisterRequest.builder()
                    .username(username)  // Use email as username
                    .password(password) // Default password, should be changed by student
                    .email(request.getEmail())
                    .firstName(request.getFullName())
                    .contactNumber(request.getPhoneNumber())
                    .active(true)
                    .role(STUDENT_ROLE)
                    .build();
            
            var authResponse = authenticationService.register(registerRequest);
            var user = authenticationService.getUserFromToken(authResponse.getToken());
            
            // Create profile with approved courses and return the DTO
            profileDTO = createProfileForUser(user, modifiedRequest);
            isNewUser = true;
            
            // Update the request status
            request.setStatus(StudentRequest.RequestStatus.APPROVED);
            request.setProcessedDate(LocalDate.now().atStartOfDay());
            request.setProcessedBy(admin);
            studentRequestRepository.save(request);
            
            // Get formatted course information for email
            String coursesHtml = getCoursesInfoHtml(approvedCourses);
            
            // Send HTML approval email for new user
            emailService.sendApprovalNotificationHtml(
                request.getEmail(),
                request.getFullName(),
                coursesHtml,
                username,
                password
            );
        }
        
        return profileDTO;
    }
    
    @Transactional
    protected StudentProfileDTO createProfileForUser(User user, StudentRequest request) {
        // Generate student ID
        String studentId = generateStudentId();
        
        // Create a student profile
        StudentProfile studentProfile = StudentProfile.builder()
                .user(user)
                .studentId(studentId)
                .gender(request.getGender())
                .knowledge(request.getKnowledge())
                .whatsAppNumber(request.getWhatsAppNumber())
                .department(request.getDepartment())
                .enrollmentDate(LocalDate.now())
                .address(request.getAddress())
                .dateOfBirth(request.getDateOfBirth())
                .bio(request.getBio())
                .build();
        
        StudentProfile savedProfile = studentProfileRepository.save(studentProfile);
        
        // Add course enrollments for all requested courses
        if (request.getCourses() != null && !request.getCourses().isEmpty()) {
            for (Course course : request.getCourses()) {
                savedProfile.addCourseEnrollment(course, LocalDate.now());
            }
            savedProfile = studentProfileRepository.save(savedProfile);
        }
        
        return mapToDTO(savedProfile);
    }
    
    /**
     * Get formatted course information for plain text emails
     */
    private String getCoursesInfoText(List<Course> courses) {
        if (courses == null || courses.isEmpty()) {
            return "No courses";
        }
        
        StringBuilder info = new StringBuilder();
        for (int i = 0; i < courses.size(); i++) {
            Course course = courses.get(i);
            info.append(i + 1).append(". ").append(course.getTitle())
//                .append(" (").append(course.getDurationInWeeks()).append(" weeks)")
                .append("\n   Description: ").append(course.getDescription())
                .append("\n");
        }
        
        return info.toString();
    }
    
    /**
     * Get formatted course information for HTML emails
     */
    private String getCoursesInfoHtml(List<Course> courses) {
        if (courses == null || courses.isEmpty()) {
            return "<p>No courses</p>";
        }
        
        StringBuilder html = new StringBuilder();
        html.append("<ul style='list-style-type: none; padding: 0;'>");
        
        for (Course course : courses) {
            html.append("<li style='margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #eee;'>");
            html.append("<h4 style='margin: 0; color: #4285f4;'>").append(course.getTitle()).append("</h4>");
//            html.append("<p style='margin: 5px 0;'><b>Duration:</b> ").append(course.getDurationInWeeks()).append(" weeks</p>");
            html.append("<p style='margin: 5px 0; color: #555;'>").append(course.getDescription()).append("</p>");
            html.append("</li>");
        }
        
        html.append("</ul>");
        return html.toString();
    }
    
    @Transactional
    public StudentProfileDTO enrollStudentInCourse(Long studentId, Long courseId) {
        StudentProfile student = studentProfileRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student profile not found with id: " + studentId));
        
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));
        
        // Check if already enrolled
        if (isEnrolledInCourse(student, course)) {
            throw new RuntimeException("Student is already enrolled in this course");
        }
        
        // Enroll in the course
        student.addCourseEnrollment(course, LocalDate.now());
        StudentProfile updatedProfile = studentProfileRepository.save(student);
        
        // Send enrollment confirmation email
        User user = student.getUser();
        List<Course> enrolledCourse = List.of(course);
        String coursesInfo = getCoursesInfoText(enrolledCourse);
        
        emailService.sendEnrollmentConfirmationEmail(
            user.getEmail(),
            user.getFirstName(),
            coursesInfo
        );
        
        return mapToDTO(updatedProfile);
    }
    
    private boolean isEnrolledInCourse(StudentProfile student, Course course) {
        return enrollmentRepository.existsByStudentAndCourse(student, course);
    }
    
    public List<StudentProfileDTO> getAllStudentProfiles() {
        return studentProfileRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    public StudentProfileDTO getStudentProfileById(Long id) {
        StudentProfile studentProfile = studentProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student profile not found with id: " + id));
        return mapToDTO(studentProfile);
    }
    
    public StudentProfileDTO getStudentProfileByUserId(Long userId) {
        List<StudentProfile> studentProfiles = studentProfileRepository.findByUserId(userId);
        if (studentProfiles.isEmpty()) {
            throw new RuntimeException("Student profile not found for user id: " + userId);
        }
        StudentProfile studentProfile = studentProfiles.get(0);
        return mapToDTO(studentProfile);
    }
    
    public StudentProfileDTO getStudentProfileByUsername(String username) {
        List<StudentProfile> studentProfiles = studentProfileRepository.findByUserUsername(username);
        if (studentProfiles.isEmpty()) {
            throw new RuntimeException("Student profile not found for username: " + username);
        }
        StudentProfile studentProfile = studentProfiles.get(0);
        return mapToDTO(studentProfile);
    }
    
    private String generateStudentId() {
        // Get the current year
        int year = LocalDate.now().getYear() % 100; // Last two digits of the year
        
        // Count existing profiles to determine the next sequential number
        long count = studentProfileRepository.count() + 1;
        
        // Format: STyyXXXX (e.g., ST220001)
        return String.format("%s%02d%04d", STUDENT_ID_PREFIX, year, count);
    }
    
    private StudentProfileDTO mapToDTO(StudentProfile studentProfile) {
        if (studentProfile == null) {
            return null;
        }
        
        List<Long> enrolledCourseIds = new ArrayList<>();
        List<StudentProfileDTO.EnrolledCourseDTO> enrolledCourseDTOs = new ArrayList<>();
        if (studentProfile.getCourseEnrollments() != null) {
            enrolledCourseDTOs = studentProfile.getCourseEnrollments().stream()
                    .map(enrollment -> StudentProfileDTO.EnrolledCourseDTO.builder()
                            .id(enrollment.getId())
                            .courseId(enrollment.getCourse().getId())
                            .courseTitle(enrollment.getCourse().getTitle())
                            .enrollmentDate(enrollment.getEnrollmentDate())
                            .status(enrollment.getStatus().name())
                            .build())
                    .collect(Collectors.toList());
        }
        
        User user = studentProfile.getUser();
        
        return StudentProfileDTO.builder()
                .id(studentProfile.getId())
                .userId(user.getId())
                .username(user.getUsername())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phoneNumber(user.getContactNumber())
                .studentId(studentProfile.getStudentId())
                .department(studentProfile.getDepartment())
                .enrollmentDate(studentProfile.getEnrollmentDate())
                .address(studentProfile.getAddress())
                .dateOfBirth(studentProfile.getDateOfBirth())
                .emergencyContactName(studentProfile.getEmergencyContactName())
                .emergencyContactRelation(studentProfile.getEmergencyContactRelation())
                .emergencyContactPhone(studentProfile.getEmergencyContactPhone())
                .bio(studentProfile.getBio())
                .enrolledCourses(enrolledCourseDTOs)
                .build();
    }

    @Transactional
    public StudentProfileDTO toggleEnrollmentStatus(Long studentProfileId, Long courseId) {
        // Find the student profile
        StudentProfile studentProfile = studentProfileRepository.findById(studentProfileId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "id", studentProfileId));
        
        // Find the course
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));
        
        // Find the enrollment
        StudentCourseEnrollment enrollment = studentProfile.getCourseEnrollments().stream()
                .filter(e -> e.getCourse().getId().equals(courseId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Enrollment not found for course: " + course.getTitle() + 
                    " in student profile: " + studentProfile.getStudentId()
                ));
        
        // Toggle the enrollment status
        enrollment.setStatus(!enrollment.getStatus().equals(StudentCourseEnrollment.EnrollmentStatus.DROPPED)? StudentCourseEnrollment.EnrollmentStatus.DROPPED: StudentCourseEnrollment.EnrollmentStatus.ACTIVE);
        
        // Save the updated profile
        StudentProfile savedProfile = studentProfileRepository.save(studentProfile);
        
        // Send email notification to student
        String status = enrollment.getStatus().toString();
        emailService.sendEnrollmentStatusChangeEmail(
            studentProfile.getUser().getEmail(),
            studentProfile.getUser().getFirstName() + " " + studentProfile.getUser().getLastName(),
            course.getTitle(),
            status
        );
        
        return mapToDTO(savedProfile);
    }
} 