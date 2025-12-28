package com.learning.system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChapterCreateDTO {
    private String title;
    private String description;
    private String content;
    private boolean free;
    private int orderIndex;
    private boolean isVideoContent;
    private String youtubeLink;
    private List<DocumentCreateDTO> documents;  // List of documents for the chapter
} 