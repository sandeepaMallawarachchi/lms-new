package com.learning.system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * DTO for Chapter creation response to avoid circular reference issues
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChapterCreationResponse {
    private Long id;
    private String title;
    private String description;
    private Integer orderIndex;
    private boolean isFree;
    private boolean isVideoContent;
    private String content;
    private String youtubeLink;
    private Long moduleId;
    private String moduleTitle;
    private List<DocumentInfo> documents;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DocumentInfo {
        private Long id;
        private String url;
        private String title;
        private String type;
    }
} 