package com.learning.system.repository;

import com.learning.system.entity.StudentRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentRequestRepository extends JpaRepository<StudentRequest, Long> {
    List<StudentRequest> findByStatus(StudentRequest.RequestStatus status);
    List<StudentRequest> findByEmail(String email);
} 