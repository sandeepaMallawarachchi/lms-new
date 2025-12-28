package com.learning.system.service;

import com.learning.system.dto.ProgressDTO;
import com.learning.system.dto.StudentDetailDTO;
import com.learning.system.dto.StudentProfileDTO;
import com.learning.system.dto.StudentProfileUpdateRequest;
import com.learning.system.entity.Course;
import com.learning.system.entity.Module;
import com.learning.system.entity.Chapter;
import com.learning.system.entity.StudentProfile;
import com.learning.system.entity.User;
import com.learning.system.repository.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class StudentDetailService {

    @Autowired
    private StudentProfileService studentProfileService;
    
    @Autowired
    private StudentProfileRepository studentProfileRepository;
    
    @Autowired
    private CourseProgressService courseProgressService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private ModuleRepository moduleRepository;
    
    @Autowired
    private ChapterRepository chapterRepository;
    
    @Autowired
    private ChapterProgressRepository chapterProgressRepository;
    
    @Value("${app.profile.images.dir:./profile-images}")
    private String profileImagesDir;
    @Autowired
    private UserRepository userRepository;

    /**
     * Get comprehensive student details by student ID
     */
    public StudentDetailDTO getStudentDetailById(Long studentId) {
        StudentProfile studentProfile = studentProfileRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student profile not found with id: " + studentId));
        
        return buildStudentDetailDTO(studentProfile);
    }
    
    /**
     * Get comprehensive student details by user ID
     */
    public StudentDetailDTO getStudentDetailByUserId(Long userId) {
        User user = userService.getUserById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        List<StudentProfile> profiles = studentProfileRepository.findByUser(user);
        if (profiles.isEmpty()) {
            throw new RuntimeException("Student profile not found for user id: " + userId);
        }
        
        return buildStudentDetailDTO(profiles.get(0));
    }
    
    /**
     * Update student profile information and profile image by student ID
     */
    @Transactional
    public StudentDetailDTO updateStudentProfile(Long studentId, StudentProfileUpdateRequest updateRequest) {
        StudentProfile studentProfile = studentProfileRepository.findByUserId(studentId).get(0);

        User user = studentProfile.getUser();
        
        // Split full name into first and last name if provided
        if (StringUtils.hasText(updateRequest.getFullName())) {
            String[] nameParts = updateRequest.getFullName().split("\\s+", 2);
            user.setFirstName(nameParts[0]);
            user.setLastName(nameParts.length > 1 ? nameParts[1] : "");
        }
        
        // Update user contact information
        if (StringUtils.hasText(updateRequest.getContactNumber())) {
            user.setContactNumber(updateRequest.getContactNumber());
        }
        
        // Save the user entity
        user = userRepository.save(user);
        
        // Update profile information
        if (StringUtils.hasText(updateRequest.getAddress())) {
            studentProfile.setAddress(updateRequest.getAddress());
        }
        
        if (updateRequest.getDateOfBirth() != null) {
            studentProfile.setDateOfBirth(updateRequest.getDateOfBirth());
        }
        
        // Update emergency contact information
        if (StringUtils.hasText(updateRequest.getEmergencyContactName())) {
            studentProfile.setEmergencyContactName(updateRequest.getEmergencyContactName());
        }
        
        if (StringUtils.hasText(updateRequest.getEmergencyContactRelation())) {
            studentProfile.setEmergencyContactRelation(updateRequest.getEmergencyContactRelation());
        }
        
        if (StringUtils.hasText(updateRequest.getEmergencyContactPhone())) {
            studentProfile.setEmergencyContactPhone(updateRequest.getEmergencyContactPhone());
        }
        
        // Update bio
        if (StringUtils.hasText(updateRequest.getBio())) {
            studentProfile.setBio(updateRequest.getBio());
        }
        
        // Handle profile image if provided
//        if (StringUtils.hasText(updateRequest.getProfileImageBase64())) {
//            String profileImageUrl = saveProfileImage(studentProfile.getStudentId(), updateRequest.getProfileImageBase64());
            studentProfile.setProfileImage(updateRequest.getProfileImageBase64());
//        }
        
        studentProfileRepository.save(studentProfile);
        
        return buildStudentDetailDTO(studentProfile);
    }
    
    /**
     * Update student profile information and profile image by user ID
     */
//    @Transactional
//    public StudentDetailDTO updateStudentProfile(Long userId, StudentProfileUpdateRequest updateRequest) {
//        User user = userService.getUserById(userId)
//                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
//
//        List<StudentProfile> profiles = studentProfileRepository.findByUser(user);
//        if (profiles.isEmpty()) {
//            throw new RuntimeException("Student profile not found for user id: " + userId);
//        }
//
//        StudentProfile studentProfile = profiles.get(0);
//
//        // Split full name into first and last name if provided
//        if (StringUtils.hasText(updateRequest.getFullName())) {
//            String[] nameParts = updateRequest.getFullName().split("\\s+", 2);
//            user.setFirstName(nameParts[0]);
//            user.setLastName(nameParts.length > 1 ? nameParts[1] : "");
//        }
//
//        // Update user contact information
//        if (StringUtils.hasText(updateRequest.getContactNumber())) {
//            user.setContactNumber(updateRequest.getContactNumber());
//        }
//
//        // Save the user entity
//        user = userService.save(user);
//
//        // Update profile information
//        if (StringUtils.hasText(updateRequest.getAddress())) {
//            studentProfile.setAddress(updateRequest.getAddress());
//        }
//
//        if (updateRequest.getDateOfBirth() != null) {
//            studentProfile.setDateOfBirth(updateRequest.getDateOfBirth());
//        }
//
//        // Update emergency contact information
//        if (StringUtils.hasText(updateRequest.getEmergencyContactName())) {
//            studentProfile.setEmergencyContactName(updateRequest.getEmergencyContactName());
//        }
//
//        if (StringUtils.hasText(updateRequest.getEmergencyContactRelation())) {
//            studentProfile.setEmergencyContactRelation(updateRequest.getEmergencyContactRelation());
//        }
//
//        if (StringUtils.hasText(updateRequest.getEmergencyContactPhone())) {
//            studentProfile.setEmergencyContactPhone(updateRequest.getEmergencyContactPhone());
//        }
//
//        // Update bio
//        if (StringUtils.hasText(updateRequest.getBio())) {
//            studentProfile.setBio(updateRequest.getBio());
//        }
//
//        // Handle profile image if provided
//        if (StringUtils.hasText(updateRequest.getProfileImageBase64())) {
//            String profileImageUrl = saveProfileImage(studentProfile.getStudentId(), updateRequest.getProfileImageBase64());
//            studentProfile.setProfileImage(profileImageUrl);
//        }
//
//        studentProfileRepository.save(studentProfile);
//
//        return buildStudentDetailDTO(studentProfile);
//    }
//
    /**
     * Save profile image from base64 encoded string
     */
    private String saveProfileImage(String studentId, String base64Image) {
        try {
            // Create directory if it doesn't exist
            File directory = new File(profileImagesDir);
            if (!directory.exists()) {
                directory.mkdirs();
            }
            
            // Remove base64 prefix if present (e.g., "data:image/jpeg;base64,")
            String base64Data = base64Image;
            if (base64Image.contains(",")) {
                base64Data = base64Image.split(",")[1];
            }
            
            // Decode base64 string to byte array
            byte[] imageBytes = Base64.getDecoder().decode(base64Data);
            
            // Generate a unique filename for the image
            String filename = studentId + "_" + UUID.randomUUID().toString() + ".jpg";
            Path filepath = Paths.get(profileImagesDir, filename);
            
            // Save the image file
            Files.write(filepath, imageBytes);
            
            // Return the relative URL to the image
            return "/profile-images/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Error saving profile image: " + e.getMessage(), e);
        }
    }
    
    /**
     * Get detailed course progress for a specific student and course
     */
    public ProgressDTO getStudentCourseDetail(Long studentId, Long courseId) {
        StudentProfile studentProfile = studentProfileRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student profile not found with id: " + studentId));
        
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));
        
        // Get detailed course progress
        return courseProgressService.getCourseProgress(courseId, studentProfile.getUser());
    }
    
    /**
     * Build the comprehensive StudentDetailDTO from a StudentProfile entity
     */
    private StudentDetailDTO buildStudentDetailDTO(StudentProfile studentProfile) {
        User user = studentProfile.getUser();
        
        // Get all enrolled courses
        List<Course> enrolledCourses = studentProfile.getCourseEnrollments().stream()
                .map(enrollment -> enrollment.getCourse())
                .collect(Collectors.toList());
        
        // Get progress for each course
        List<ProgressDTO> courseProgressList = courseProgressService.getAllCoursesProgress(enrolledCourses, user);
        
        // Get overall progress directly from CourseProgressService to ensure consistency
        ProgressDTO overallProgress = courseProgressService.getOverallProgress(enrolledCourses, user);
        
        // Build course progress detail DTOs and calculate overall progress from bottom up
        List<StudentDetailDTO.CourseProgressDetailDTO> courseProgressDetails = new ArrayList<>();
        
        for (ProgressDTO courseProgress : courseProgressList) {
            Course course = enrolledCourses.stream()
                    .filter(c -> c.getId().equals(courseProgress.getId()))
                    .findFirst()
                    .orElse(null);
            
            if (course == null) continue;
            
            // Get enrollment date for this course
            LocalDate enrollmentDate = studentProfile.getCourseEnrollments().stream()
                    .filter(enrollment -> enrollment.getCourse().getId().equals(course.getId()))
                    .map(enrollment -> enrollment.getEnrollmentDate())
                    .findFirst()
                    .orElse(null);
            
            // Build module progress DTOs
            List<StudentDetailDTO.ModuleProgressDTO> moduleProgressDTOs = new ArrayList<>();
            
            // Get all modules for this course
            List<Module> modules = moduleRepository.findByCourse_IdOrderByOrderIndexAsc(course.getId());
            
            for (Module module : modules) {
                // Get all chapters for this module
                List<Chapter> chapters = chapterRepository.findByModule_Id(module.getId());
                
                // Build chapter progress DTOs
                List<StudentDetailDTO.ChapterProgressDTO> chapterProgressDTOs = new ArrayList<>();
                
                for (Chapter chapter : chapters) {
                    // Get chapter progress details
                    boolean chapterCompleted = courseProgressService.isChapterCompleted(chapter.getId(), user);
                    
                    StudentDetailDTO.ChapterProgressDTO chapterProgressDTO = StudentDetailDTO.ChapterProgressDTO.builder()
                            .chapterId(chapter.getId())
                            .chapterTitle(chapter.getTitle())
                            .completed(chapterCompleted)
                            .build();
                    
                    chapterProgressDTOs.add(chapterProgressDTO);
                }
                
                // Find matching module from courseProgress to get accurate progress percentage
                int moduleProgressPercentage = 0;
                boolean moduleCompleted = courseProgressService.isModuleCompleted(module.getId(), user);
                
                // Find this module in the courseProgress items and use its progress percentage
                for (ProgressDTO.ProgressItemDTO moduleProgress : courseProgress.getItems()) {
                    if (moduleProgress.getId().equals(module.getId())) {
                        moduleProgressPercentage = moduleProgress.getProgressPercentage();
                        break;
                    }
                }
                
                StudentDetailDTO.ModuleProgressDTO moduleProgressDTO = StudentDetailDTO.ModuleProgressDTO.builder()
                        .moduleId(module.getId())
                        .moduleTitle(module.getTitle())
                        .progressPercentage(moduleProgressPercentage)
                        .completed(moduleCompleted)
                        .chapters(chapterProgressDTOs)
                        .build();
                
                moduleProgressDTOs.add(moduleProgressDTO);
            }
            
            // Use course progress directly from the CourseProgressService
            StudentDetailDTO.CourseProgressDetailDTO courseProgressDetail = StudentDetailDTO.CourseProgressDetailDTO.builder()
                    .courseId(course.getId())
                    .courseTitle(course.getTitle())
                    .courseDescription(course.getDescription())
                    .enrollmentDate(enrollmentDate)
                    .progressPercentage(courseProgress.getProgressPercentage())
                    .completedChapters(courseProgress.getCompletedChapters())
                    .totalChapters(courseProgress.getTotalChapters())
                    .finalScore(courseProgress.isCompleted() ? "85%" : null)
                    .modules(moduleProgressDTOs)
                    .build();
            
            courseProgressDetails.add(courseProgressDetail);
        }
        
        // Build and return the final StudentDetailDTO
        return StudentDetailDTO.builder()
                .id(studentProfile.getId())
                .studentId(studentProfile.getStudentId())
                .fullName(user.getFirstName() + " " +( (user.getLastName()!=null)?user.getLastName():""))
                .email(user.getEmail())
                .status(user.isActive() ? "Active" : "Inactive")
                .department(studentProfile.getDepartment())
                .enrollmentDate(studentProfile.getEnrollmentDate())
                .profileImage(studentProfile.getProfileImage())
                // Add personal information
                .contactNumber(user.getContactNumber())
                .address(studentProfile.getAddress())
                .dateOfBirth(studentProfile.getDateOfBirth())
                // Add emergency contact information
                // Add bio information
                .bio(studentProfile.getBio())
                // Progress information
                .overallProgressPercentage(overallProgress.getProgressPercentage())
                .courseProgress(courseProgressDetails)
                .build();
    }
} 