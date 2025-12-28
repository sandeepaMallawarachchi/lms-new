package com.learning.system.service;

import com.learning.system.dto.ProgressDTO;
import com.learning.system.entity.*;
import com.learning.system.entity.Module;
import com.learning.system.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CourseProgressService {
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    
    @Autowired
    private ModuleRepository moduleRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private ChapterRepository chapterRepository;
    
    @Autowired
    private ChapterProgressRepository chapterProgressRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Transactional
    public void markModuleAsCompleted(Long moduleId, User user) {
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new RuntimeException("Module not found"));
        
        if (!module.getCompletedByUsers().contains(user)) {
            module.getCompletedByUsers().add(user);
            moduleRepository.save(module);
        }
    }

    public boolean isModuleCompleted(Long moduleId, User user) {
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new RuntimeException("Module not found"));
        return module.getCompletedByUsers().contains(user);
    }
    
    @Transactional
    public void markChapterAsCompleted(Long chapterId, User user) {
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new RuntimeException("Chapter not found"));
        
        // Find or create chapter progress record
        List<ChapterProgress> progressList = chapterProgressRepository.findByChapterAndUser(chapter, user);
        ChapterProgress progress;
        
        if (progressList.isEmpty()) {
            // Create new progress record
            progress = ChapterProgress.builder()
                    .chapter(chapter)
                    .user(user)
                    .build();
            progress = chapterProgressRepository.save(progress);
        } else {
            // Use existing record (first one if multiple)
            progress = progressList.get(0);
        }
                
        // Set to 100% progress and mark as completed
        progress.updateProgress(100, 0);
        chapterProgressRepository.save(progress);
        
        // Also update the legacy completedByUsers list for backwards compatibility
        if (!chapter.getCompletedByUsers().contains(user)) {
            chapter.getCompletedByUsers().add(user);
            chapterRepository.save(chapter);
            
            // Check if all chapters in the module are completed
            Module module = chapter.getModule();
            List<Chapter> moduleChapters = chapterRepository.findByModule_Id(module.getId());
            
            boolean allChaptersCompleted = moduleChapters.stream()
                    .allMatch(ch -> ch.getCompletedByUsers().contains(user));
            
            // If all chapters completed, mark module as completed automatically
            if (allChaptersCompleted && !module.getCompletedByUsers().contains(user)) {
                markModuleAsCompleted(module.getId(), user);
            }
        }
    }
    
    @Transactional
    public void updateChapterProgress(Long chapterId, User user, int progressPercentage, int timeSpentSeconds) {
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new RuntimeException("Chapter not found"));
        
        // Find or create chapter progress record
        List<ChapterProgress> progressList = chapterProgressRepository.findByChapterAndUser(chapter, user);
        ChapterProgress progress;
        
        if (progressList.isEmpty()) {
            // Create new progress record
            progress = ChapterProgress.builder()
                    .chapter(chapter)
                    .user(user)
                    .build();
            progress = chapterProgressRepository.save(progress);
        } else {
            // Use existing record (first one if multiple)
            progress = progressList.get(0);
        }
                
        // Update progress
        progress.updateProgress(progressPercentage, timeSpentSeconds);
        chapterProgressRepository.save(progress);
        
        // If chapter is completed (progress is 100%), also update the legacy completedByUsers list
        if (progress.isCompleted() && !chapter.getCompletedByUsers().contains(user)) {
            chapter.getCompletedByUsers().add(user);
            chapterRepository.save(chapter);
            
            // Check if all chapters in the module are completed
            Module module = chapter.getModule();
            List<Chapter> moduleChapters = chapterRepository.findByModule_Id(module.getId());
            
            boolean allChaptersCompleted = moduleChapters.stream()
                    .allMatch(ch -> {
                        List<ChapterProgress> chProgressList = chapterProgressRepository.findByChapterAndUser(ch, user);
                        return !chProgressList.isEmpty() && chProgressList.get(0).isCompleted();
                    });
            
            // If all chapters completed, mark module as completed automatically
            if (allChaptersCompleted && !module.getCompletedByUsers().contains(user)) {
                markModuleAsCompleted(module.getId(), user);
            }
        }
    }
    
    public boolean isChapterCompleted(Long chapterId, User user) {
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new RuntimeException("Chapter not found"));
        
        // First check the ChapterProgress record
        List<ChapterProgress> progressList = chapterProgressRepository.findByChapterAndUser(chapter, user);
        if (!progressList.isEmpty()) {
            return progressList.get(0).isCompleted();
        }
        
        // Fall back to legacy check
        return chapter.getCompletedByUsers().contains(user);
    }
    
    public int getChapterProgressPercentage(Long chapterId, User user) {
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new RuntimeException("Chapter not found"));
        
        // Check ChapterProgress record
        List<ChapterProgress> progressList = chapterProgressRepository.findByChapterAndUser(chapter, user);
        if (!progressList.isEmpty()) {
            return progressList.get(0).getProgressPercentage();
        }
        
        // If chapter is completed in legacy system but no progress record, return 100%
        if (chapter.getCompletedByUsers().contains(user)) {
            return 100;
        }
        
        // Default is 0% progress
        return 0;
    }

    public boolean hasCompletedAllPreviousModules(Long moduleId, User user) {
        Module currentModule = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new RuntimeException("Module not found"));
        
        List<Module> courseModules = moduleRepository.findByCourse_IdOrderByOrderIndexAsc(currentModule.getCourse().getId());
        
        // Find the index of the current module
        int currentModuleIndex = -1;
        for (int i = 0; i < courseModules.size(); i++) {
            if (courseModules.get(i).getId().equals(moduleId)) {
                currentModuleIndex = i;
                break;
            }
        }
        
        if (currentModuleIndex == -1) {
            throw new RuntimeException("Module not found in course modules");
        }
        
        // Check if all previous modules are completed
        for (int i = 0; i < currentModuleIndex; i++) {
            Module previousModule = courseModules.get(i);
            if (!previousModule.getCompletedByUsers().contains(user)) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Get detailed progress for a specific course
     */
    public ProgressDTO getCourseProgress(Long courseId, User user) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        
        // Get student profile and enrollment status
        StudentProfile studentProfile = studentProfileRepository.findByUser(user)
                .stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Student profile not found"));
        
        // Get enrollment status
        String enrollmentStatus = studentProfile.getCourseEnrollments().stream()
                .filter(enrollment -> enrollment.getCourse().getId().equals(courseId))
                .findFirst()
                .map(enrollment -> enrollment.getStatus().name())
                .orElse("NOT_ENROLLED");
        
        List<Module> modules = moduleRepository.findByCourse_IdOrderByOrderIndexAsc(courseId);
        
        int totalChapters = 0;
        int completedChapters = 0;
        int completedModules = 0;
        int totalModules = modules.size();
        
        List<ProgressDTO.ProgressItemDTO> moduleProgressList = new ArrayList<>();
        
        for (Module module : modules) {
            List<Chapter> chapters = chapterRepository.findByModule_Id(module.getId());
            totalChapters += chapters.size();
            
            int moduleCompletedChapters = 0;
            List<ProgressDTO.ChapterProgressDTO> chapterProgressList = new ArrayList<>();
            
            for (Chapter chapter : chapters) {
                boolean isCompleted = isChapterCompleted(chapter.getId(), user);
                if (isCompleted) {
                    completedChapters++;
                    moduleCompletedChapters++;
                }
                
                int chapterProgress = getChapterProgressPercentage(chapter.getId(), user);
                
                chapterProgressList.add(ProgressDTO.ChapterProgressDTO.builder()
                        .id(chapter.getId())
                        .title(chapter.getTitle())
                        .description(chapter.getDescription())
                        .orderIndex(chapter.getOrderIndex())
                        .completed(isCompleted)
                        .isFree(chapter.isFree())
                        .isVideoContent(chapter.isVideoContent())
                        .youtubeLink(chapter.getYoutubeLink())
                        .progressPercentage(chapterProgress)
                        .content(chapter.getContent())
                        .documents(chapter.getDocuments() != null ?
                            chapter.getDocuments().stream()
                                .map(doc -> ProgressDTO.ChapterProgressDTO.DocumentInfo.builder()
                                    .id(doc.getId())
                                    .name(doc.getName())
                                    .url(doc.getUrl())
                                    .type(doc.getType())
                                    .size(doc.getSize())
                                    .build())
                                .collect(Collectors.toList())
                            : new ArrayList<>())
                        .build());
            }
            
            int moduleProgressPercentage = chapters.isEmpty() ? 0 : 
                    (moduleCompletedChapters * 100) / chapters.size();
            boolean isModuleCompleted = moduleCompletedChapters == chapters.size() && !chapters.isEmpty();
            
            if (isModuleCompleted) {
                completedModules++;
            }
            
            moduleProgressList.add(ProgressDTO.ProgressItemDTO.builder()
                    .id(module.getId())
                    .title(module.getTitle())
                    .description(module.getDescription())
                    .orderIndex(module.getOrderIndex())
                    .progressPercentage(moduleProgressPercentage)
                    .completedChapters(moduleCompletedChapters)
                    .totalChapters(chapters.size())
                    .completed(isModuleCompleted)
                    .chapters(chapterProgressList)
                    .build());
        }
        
        // Calculate overall course progress
        int progressPercentage = totalChapters == 0 ? 0 : (completedChapters * 100) / totalChapters;
        
        return ProgressDTO.builder()
                .id(courseId)
                .title(course.getTitle())
                .description(course.getDescription())
                .thumbnailUrl(course.getThumbnailUrl())
                .progressPercentage(progressPercentage)
                .completedChapters(completedChapters)
                .totalChapters(totalChapters)
                .completedModules(completedModules)
                .totalModules(totalModules)
                .completed(completedChapters == totalChapters && totalChapters > 0)
                .studentCourseEnrollmentStatus(enrollmentStatus)
                .items(moduleProgressList)
                .build();
    }
    
    /**
     * Get progress for multiple courses
     */
    public List<ProgressDTO> getAllCoursesProgress(List<Course> courses, User user) {
        return courses.stream()
                .map(course -> getCourseProgress(course.getId(), user))
                .collect(Collectors.toList());
    }
    
    /**
     * Get overall progress across all courses
     */
    public ProgressDTO getOverallProgress(List<Course> enrolledCourses, User user) {
        if (enrolledCourses.isEmpty()) {
            return ProgressDTO.builder()
                    .progressPercentage(0)
                    .completedChapters(0)
                    .totalChapters(0)
                    .completedModules(0)
                    .totalModules(0)
                    .completed(false)
                    .items(new ArrayList<>())
                    .build();
        }
        
        int totalCompletedChapters = 0;
        int overallTotalChapters = 0;
        int totalCompletedModules = 0;
        int overallTotalModules = 0;
        
        List<ProgressDTO.ProgressItemDTO> courseProgressList = new ArrayList<>();
        
        for (Course course : enrolledCourses) {
            ProgressDTO courseProgress = getCourseProgress(course.getId(), user);
            totalCompletedChapters += courseProgress.getCompletedChapters();
            overallTotalChapters += courseProgress.getTotalChapters();
            totalCompletedModules += courseProgress.getCompletedModules();
            overallTotalModules += courseProgress.getTotalModules();
            
            courseProgressList.add(ProgressDTO.ProgressItemDTO.builder()
                    .id(course.getId())
                    .title(course.getTitle())
                    .description(course.getDescription())
                    .progressPercentage(courseProgress.getProgressPercentage())
                    .completedChapters(courseProgress.getCompletedChapters())
                    .totalChapters(courseProgress.getTotalChapters())
                    .completed(courseProgress.isCompleted())
                    .build());
        }
        
        // Calculate overall progress percentage
        int overallProgressPercentage = overallTotalChapters == 0 ? 0 : 
                (totalCompletedChapters * 100) / overallTotalChapters;
        
        return ProgressDTO.builder()
                .progressPercentage(overallProgressPercentage)
                .completedChapters(totalCompletedChapters)
                .totalChapters(overallTotalChapters)
                .completedModules(totalCompletedModules)
                .totalModules(overallTotalModules)
                .completed(totalCompletedChapters == overallTotalChapters && overallTotalChapters > 0)
                .items(courseProgressList)
                .build();
    }
} 