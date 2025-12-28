package com.learning.system.repository;

import com.learning.system.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByCreatedBy_Id(Long userId);
    List<Course> findByPublished(boolean published);
} 