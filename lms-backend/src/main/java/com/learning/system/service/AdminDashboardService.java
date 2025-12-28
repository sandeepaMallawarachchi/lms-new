package com.learning.system.service;

import com.learning.system.dto.ProgressDTO;
import com.learning.system.dto.StudentManagementStatsDTO;
import com.learning.system.dto.StudentsByCourseDTO;
import com.learning.system.entity.ChapterProgress;
import com.learning.system.entity.Course;
import com.learning.system.entity.StudentCourseEnrollment;
import com.learning.system.entity.StudentProfile;
import com.learning.system.entity.User;
import com.learning.system.repository.ChapterProgressRepository;
import com.learning.system.repository.CourseRepository;
import com.learning.system.repository.StudentCourseEnrollmentRepository;
import com.learning.system.repository.StudentProfileRepository;
import com.learning.system.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminDashboardService {

    @Autowired
    private StudentProfileRepository studentProfileRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private StudentCourseEnrollmentRepository enrollmentRepository;
    
    @Autowired
    private CourseProgressService courseProgressService;
    
    @Autowired
    private ChapterProgressRepository chapterProgressRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Get student management statistics for the admin dashboard
     * 
     * @param activeOnly Whether to return statistics for active users (true) or inactive users (false)
     * @return StudentManagementStatsDTO containing total students, enrollment by course, and completion rate
     */
    public StudentManagementStatsDTO getStudentManagementStats(boolean activeOnly) {
        // Get all students and filter based on active status
        List<StudentProfile> allStudents = studentProfileRepository.findAll();
        List<StudentProfile> filteredStudents = allStudents.stream()
                .filter(student -> activeOnly ? student.getUser().isActive() : !student.getUser().isActive())
                .collect(Collectors.toList());
        
        // Get total number of filtered students
        long totalStudents = filteredStudents.size();
        
        // Get all courses
        List<Course> courses = courseRepository.findAll();
        
        // Create list to store course enrollment data
        List<StudentManagementStatsDTO.CourseEnrollmentDTO> enrollmentData = new ArrayList<>();
        
        // For each course, count the number of enrollments for filtered students
        for (Course course : courses) {
            List<StudentCourseEnrollment> courseEnrollments = enrollmentRepository.findByCourse(course);
            int enrollmentCount = (int) courseEnrollments.stream()
                    .filter(enrollment -> activeOnly ? 
                            enrollment.getStudent().getUser().isActive() : 
                            !enrollment.getStudent().getUser().isActive())
                    .count();
            
            // Create course enrollment DTO
            StudentManagementStatsDTO.CourseEnrollmentDTO courseEnrollment = 
                StudentManagementStatsDTO.CourseEnrollmentDTO.builder()
                    .courseId(course.getId())
                    .courseName(course.getTitle())
                    .studentCount(enrollmentCount)
                    .build();
            
            enrollmentData.add(courseEnrollment);
        }
        
        // Calculate overall completion rate for filtered students
        double completionRate = calculateOverallCompletionRate(activeOnly);
        
        return StudentManagementStatsDTO.builder()
                .totalStudents((int) totalStudents)
                .enrollmentByCourse(enrollmentData)
                .completionRate(completionRate)
                .build();
    }
    
    /**
     * Get students enrolled in a specific course
     * 
     * @param courseId The course ID to get students for
     * @param page The page number (0-based)
     * @param size The page size
     * @return StudentsByCourseDTO containing course details and enrolled students
     */
    public StudentsByCourseDTO getStudentsByCourse(Long courseId, int page, int size) {
        // Get the course
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));
        
        // Get all enrollments for this course
        List<StudentCourseEnrollment> enrollments = enrollmentRepository.findByCourse(course);
        
        // Calculate average completion rate for this course
        double totalCompletionRate = 0.0;
        
        // Create list for student enrollments
        List<StudentsByCourseDTO.StudentEnrollmentDTO> allStudentEnrollments = new ArrayList<>();
        int activeCount = 0;
        int inactiveCount = 0;
        
        // Process each enrollment
        for (StudentCourseEnrollment enrollment : enrollments) {
            StudentProfile student = enrollment.getStudent();
            User user = student.getUser();
            boolean isActive = user.isActive();
            
            // Update active/inactive counts
            if (isActive) {
                activeCount++;
            } else {
                inactiveCount++;
            }
            
            // Calculate student progress percentage for this course using CourseProgressService
            int progressPercentage = calculateStudentCourseProgress(user, courseId);
            
            // Add to total for average calculation if user is active
            if (isActive) {
                totalCompletionRate += progressPercentage;
            }
            
            // Create the DTO
            StudentsByCourseDTO.StudentEnrollmentDTO studentDTO = StudentsByCourseDTO.StudentEnrollmentDTO.builder()
                    .studentId(student.getId())
                    .studentName(student.getUser().getFirstName() + " " +( (student.getUser().getLastName()!=null)?student.getUser().getLastName():""))
                    .email(student.getUser().getEmail())
                    .profileImage(student.getProfileImage())
                    .enrollmentDate(enrollment.getEnrollmentDate())
                    .progressPercentage(progressPercentage)
                    .active(isActive)
                    .enrollmentStatus(enrollment.getStatus().name())
                    .build();
            
            allStudentEnrollments.add(studentDTO);
        }
        
        // Calculate average completion rate for active users
        double averageCompletionRate = activeCount > 0 ? 
                totalCompletionRate / activeCount : 0.0;
        
        // Manually paginate the results
        int totalElements = allStudentEnrollments.size();
        int totalPages = (int) Math.ceil((double) totalElements / size);
        
        // Ensure page is within bounds
        if (page >= totalPages && totalPages > 0) {
            page = totalPages - 1;
        }
        
        // Calculate start and end indices
        int start = page * size;
        int end = Math.min(start + size, totalElements);
        
        // Extract the page content
        List<StudentsByCourseDTO.StudentEnrollmentDTO> pageContent;
        if (start < totalElements) {
            pageContent = allStudentEnrollments.subList(start, end);
        } else {
            pageContent = new ArrayList<>();
        }
        
        // Build and return the DTO
        return StudentsByCourseDTO.builder()
                .courseId(course.getId())
                .courseTitle(course.getTitle())
                .courseDescription(course.getDescription())
                .totalStudents(activeCount + inactiveCount)
                .activeStudents(activeCount)
                .inactiveStudents(inactiveCount)
                .averageCompletionRate(averageCompletionRate)
                .students(pageContent)
                .build();
    }
    
    /**
     * Get paginated list of students enrolled in a specific course
     * 
     * @param courseId The course ID to get students for
     * @param page The page number (0-based)
     * @param size The page size
     * @param activeOnly Whether to return only active users (true) or all users (false)
     * @return Paginated StudentsByCourseDTO.PageResponse containing course details and enrolled students
     */
    public StudentsByCourseDTO.PageResponse getStudentsByCoursePaginated(Long courseId, int page, int size, boolean activeOnly) {
        // Get the course
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));
        
        // Get all enrollments for this course
        List<StudentCourseEnrollment> allEnrollments = enrollmentRepository.findByCourse(course);
        
        // Calculate average completion rate for all active enrollments in this course
        double totalCompletionRate = 0.0;
        List<StudentsByCourseDTO.StudentEnrollmentDTO> allStudentEnrollments = new ArrayList<>();
        List<StudentsByCourseDTO.StudentEnrollmentDTO> filteredStudentEnrollments = new ArrayList<>();
        int activeCount = 0;
        int inactiveCount = 0;
        
        // Process each enrollment to calculate overall average completion rate for active users
        for (StudentCourseEnrollment enrollment : allEnrollments) {
            StudentProfile student = enrollment.getStudent();
            User user = student.getUser();
            boolean isActive = user.isActive();
            
            // Update active/inactive counts
            if (isActive) {
                activeCount++;
            } else {
                inactiveCount++;
            }
            
            // Calculate student progress percentage for this course using CourseProgressService
            int progressPercentage = calculateStudentCourseProgress(user, courseId);
            
            // Create the DTO
            StudentsByCourseDTO.StudentEnrollmentDTO studentDTO = StudentsByCourseDTO.StudentEnrollmentDTO.builder()
                    .studentId(student.getId())
                    .studentName(student.getUser().getFirstName() + " " +( (student.getUser().getLastName()!=null)?student.getUser().getLastName():""))
                    .email(student.getUser().getEmail())
                    .profileImage(student.getProfileImage())
                    .enrollmentDate(enrollment.getEnrollmentDate())
                    .progressPercentage(progressPercentage)
                    .active(isActive)
                    .build();
            
            // Add to all enrollments for statistics
            allStudentEnrollments.add(studentDTO);
            
            // Add to total for average calculation if user is active
            if (isActive) {
                totalCompletionRate += progressPercentage;
            }
            
            // Filter based on activeOnly parameter for the response
            if (activeOnly && !isActive) {
                continue; // Skip inactive users when activeOnly is true
            } else if (!activeOnly && isActive) {
                continue; // Skip active users when activeOnly is false (get only inactive)
            }
            
            filteredStudentEnrollments.add(studentDTO);
        }
        
        // Calculate average completion rate for active users
        double averageCompletionRate = activeCount > 0 ? 
                totalCompletionRate / activeCount : 0.0;
        
        // Manually paginate the filtered results
        int totalElements = filteredStudentEnrollments.size();
        int totalPages = (int) Math.ceil((double) totalElements / size);
        
        // Ensure page is within bounds
        if (page >= totalPages && totalPages > 0) {
            page = totalPages - 1;
        }
        
        // Calculate start and end indices
        int start = page * size;
        int end = Math.min(start + size, totalElements);
        
        // Extract the page content
        List<StudentsByCourseDTO.StudentEnrollmentDTO> pageContent;
        if (start < totalElements) {
            pageContent = filteredStudentEnrollments.subList(start, end);
        } else {
            pageContent = new ArrayList<>();
        }
        
        // Build and return the paginated response
        return StudentsByCourseDTO.PageResponse.builder()
                .courseId(course.getId())
                .courseTitle(course.getTitle())
                .courseDescription(course.getDescription())
                .totalStudents(activeCount + inactiveCount)
                .activeStudents(activeCount)
                .inactiveStudents(inactiveCount)
                .averageCompletionRate(averageCompletionRate)
                .page(page)
                .size(size)
                .totalPages(totalPages)
                .totalElements(totalElements)
                .content(pageContent)
                .build();
    }
    
    /**
     * Calculate a student's progress percentage for a specific course
     * using the CourseProgressService to ensure consistency with other parts of the application
     * 
     * @param user The user
     * @param courseId The course ID
     * @return The progress percentage
     */
    private int calculateStudentCourseProgress(User user, Long courseId) {
        // Use CourseProgressService to get course progress
        ProgressDTO courseProgress = courseProgressService.getCourseProgress(courseId, user);
        return courseProgress.getProgressPercentage();
    }
    
    /**
     * Calculate the overall completion rate across all courses for filtered students
     * 
     * @param activeOnly Whether to calculate for active users (true) or inactive users (false)
     * @return completion rate as a percentage
     */
    private double calculateOverallCompletionRate(boolean activeOnly) {
        // Get all students and filter based on active status
        List<StudentProfile> allStudents = studentProfileRepository.findAll();
        List<StudentProfile> filteredStudents = allStudents.stream()
                .filter(student -> activeOnly ? student.getUser().isActive() : !student.getUser().isActive())
                .collect(Collectors.toList());
        
        if (filteredStudents.isEmpty()) {
            return 0.0;
        }
        
        // Calculate overall completion rate
        double totalCompletionRate = 0.0;
        int totalEnrollments = 0;
        
        // For each filtered student, calculate their average completion rate across all courses
        for (StudentProfile student : filteredStudents) {
            // Get all enrollments for this student
            List<StudentCourseEnrollment> enrollments = student.getCourseEnrollments();
            
            if (enrollments.isEmpty()) {
                continue;
            }
            
            totalEnrollments += enrollments.size();
            User user = student.getUser();
            
            // For each enrollment, calculate the progress percentage
            for (StudentCourseEnrollment enrollment : enrollments) {
                Course course = enrollment.getCourse();
                Long courseId = course.getId();
                
                // Calculate student progress percentage for this course
                int progressPercentage = calculateStudentCourseProgress(user, courseId);
                
                totalCompletionRate += progressPercentage;
            }
        }
        
        // Return the average completion rate
        return totalEnrollments > 0 ? (totalCompletionRate / totalEnrollments) : 0.0;
    }

    public StudentManagementStatsDTO getStudentManagementStats() {
        // Get all students
        List<StudentProfile> allStudents = studentProfileRepository.findAll();
        
        // Get total number of active students
        long totalActiveStudents = allStudents.stream()
                .filter(student -> student.getUser().isActive())
                .count();
        
        // Get all courses
        List<Course> courses = courseRepository.findAll();
        
        // Create list to store course enrollment data
        List<StudentManagementStatsDTO.CourseEnrollmentDTO> enrollmentData = new ArrayList<>();
        
        // For each course, count the number of active enrollments
        for (Course course : courses) {
            List<StudentCourseEnrollment> courseEnrollments = enrollmentRepository.findByCourse(course);
            int activeEnrollmentCount = (int) courseEnrollments.stream()
                    .filter(enrollment -> enrollment.getStudent().getUser().isActive())
                    .count();
            
            // Create course enrollment DTO
            StudentManagementStatsDTO.CourseEnrollmentDTO courseEnrollment = 
                StudentManagementStatsDTO.CourseEnrollmentDTO.builder()
                    .courseId(course.getId())
                    .courseName(course.getTitle())
                    .studentCount(activeEnrollmentCount)
                    .build();
            
            enrollmentData.add(courseEnrollment);
        }
        
        // Calculate overall completion rate for active users
        double completionRate = calculateOverallCompletionRate(true);
        
        return StudentManagementStatsDTO.builder()
                .totalStudents((int) totalActiveStudents)
                .enrollmentByCourse(enrollmentData)
                .completionRate(completionRate)
                .build();
    }

    /**
     * Toggle the active status of a user by their student profile ID
     * 
     * @param studentProfileId The ID of the student profile
     * @return true if the user was activated, false if deactivated
     * @throws RuntimeException if student profile is not found
     */
    public boolean toggleUserActiveStatus(Long studentProfileId) {
        // Get the student profile
        StudentProfile studentProfile = studentProfileRepository.findById(studentProfileId)
                .orElseThrow(() -> new RuntimeException("Student profile not found with id: " + studentProfileId));
        
        // Get the associated user
        User user = studentProfile.getUser();
        
        // Toggle the active status
        user.setActive(!user.isActive());
        
        // Save the changes
        userRepository.save(user);
        
        return user.isActive();
    }
} 