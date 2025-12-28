package com.learning.system.repository;

import com.learning.system.entity.StudentProfile;
import com.learning.system.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {
    List<StudentProfile> findByUser(User user);
    
    @Query("SELECT sp FROM StudentProfile sp WHERE sp.user.id = :userId")
    List<StudentProfile> findByUserId(@Param("userId") Long userId);
    
    Optional<StudentProfile> findByStudentId(String studentId);
    
    @Query("SELECT sp FROM StudentProfile sp WHERE sp.user.username = :username")
    List<StudentProfile> findByUserUsername(@Param("username") String username);
    
    boolean existsByStudentId(String studentId);
} 