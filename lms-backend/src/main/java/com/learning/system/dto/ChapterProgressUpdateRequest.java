package com.learning.system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for updating progress on a chapter
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChapterProgressUpdateRequest {
    /**
     * Progress percentage (0-100)
     */
    private int progressPercentage;
    
    /**
     * Time spent on this session in seconds
     */
    private int timeSpentSeconds;
} 