package com.learning.system.repository;

import com.learning.system.entity.StudentCourseRequest;
import com.learning.system.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentCourseRequestRepository extends JpaRepository<StudentCourseRequest, Long> {
    List<StudentCourseRequest> findByStatus(StudentCourseRequest.RequestStatus status);
    List<StudentCourseRequest> findByStudent(User student);
    List<StudentCourseRequest> findByStudentAndStatus(User student, StudentCourseRequest.RequestStatus status);
} 