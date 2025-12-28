package com.learning.system.repository;

import com.learning.system.entity.Course;
import com.learning.system.entity.StudentCourseEnrollment;
import com.learning.system.entity.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentCourseEnrollmentRepository extends JpaRepository<StudentCourseEnrollment, Long> {
    List<StudentCourseEnrollment> findByStudent(StudentProfile student);
    List<StudentCourseEnrollment> findByCourse(Course course);
    Optional<StudentCourseEnrollment> findByStudentAndCourse(StudentProfile student, Course course);
    boolean existsByStudentAndCourse(StudentProfile student, Course course);
} 