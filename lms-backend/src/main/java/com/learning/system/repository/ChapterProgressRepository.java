package com.learning.system.repository;

import com.learning.system.entity.Chapter;
import com.learning.system.entity.ChapterProgress;
import com.learning.system.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChapterProgressRepository extends JpaRepository<ChapterProgress, Long> {
    /**
     * Find ChapterProgress by chapter and user
     */
    List<ChapterProgress> findByChapterAndUser(Chapter chapter, User user);
    
    /**
     * Find all ChapterProgress for a specific user
     */
    List<ChapterProgress> findByUser(User user);
    
    /**
     * Find all ChapterProgress for chapters in a module
     */
    @Query("SELECT cp FROM ChapterProgress cp WHERE cp.chapter.module.id = :moduleId AND cp.user.id = :userId")
    List<ChapterProgress> findByModuleIdAndUserId(Long moduleId, Long userId);
    
    /**
     * Find all ChapterProgress for chapters in a course
     */
    @Query("SELECT cp FROM ChapterProgress cp WHERE cp.chapter.module.course.id = :courseId AND cp.user.id = :userId")
    List<ChapterProgress> findByCourseIdAndUserId(Long courseId, Long userId);
    
    /**
     * Find all completed chapters for a user
     */
    List<ChapterProgress> findByUserAndCompletedIsTrue(User user);
    
    /**
     * Count completed chapters in a course for a user
     */
    @Query("SELECT COUNT(cp) FROM ChapterProgress cp WHERE cp.chapter.module.course.id = :courseId AND cp.user.id = :userId AND cp.completed = true")
    Long countCompletedChaptersInCourse(Long courseId, Long userId);
    
    /**
     * Count total chapters in a course
     */
    @Query("SELECT COUNT(c) FROM Chapter c WHERE c.module.course.id = :courseId")
    Long countTotalChaptersInCourse(Long courseId);
} 