package com.learning.system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChapterResponse {
    private Long id;
    private String title;
    private String description;
    private int orderIndex;
    private boolean isFree;
    private String videoUrl;
    private boolean isVideoContent;
    private String content;
    private String youtubeLink;
    private DocumentResponse document;
    private List<DocumentResponse> documents;
}