package com.learning.system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * DTO for representing progress data for courses, modules, and chapters
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgressDTO {
    private Long id;
    private String title;
    private String description;
    private String thumbnailUrl;
    private boolean completed;
    private int progressPercentage;
    private int totalItems;
    private int completedItems;
    
    // Additional tracking for courses
    private int totalModules;
    private int completedModules;
    private int totalChapters;
    private int completedChapters;
    
    private String studentCourseEnrollmentStatus;
    
    /**
     * List of child items with their progress details
     * Used for showing module details within a course or chapters within a module
     */
    @Builder.Default
    private List<ProgressItemDTO> items = new ArrayList<>();
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProgressItemDTO {
        private Long id;
        private String title;
        private String description;
        private int orderIndex;
        private boolean completed;
        private int progressPercentage;
        private int totalItems;
        private int completedItems;
        private int totalChapters;
        private int completedChapters;
        
        /**
         * For modules, this contains chapter completion details
         * For courses, this is null
         */
        @Builder.Default
        private List<ChapterProgressDTO> chapters = new ArrayList<>();
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChapterProgressDTO {
        private Long id;
        private String title;
        private String description;
        private int orderIndex;
        private boolean completed;
        private boolean isFree;
        private boolean isVideoContent;
        private String youtubeLink;
        private int progressPercentage;
        private int timeSpentSeconds;
        private String lastUpdated;
        private String content;
        private List<DocumentInfo> documents;

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class DocumentInfo {
            private Long id;
            private String name;
            private String url;
            private String type;
            private Long size;
        }
    }
} 