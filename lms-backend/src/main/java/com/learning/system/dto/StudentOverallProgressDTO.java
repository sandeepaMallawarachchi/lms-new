package com.learning.system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * DTO for representing a student's overall progress across all courses
 * Contains both the overall progress summary and individual course progress details
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentOverallProgressDTO {
    private ProgressDTO overallProgress;
    
    @Builder.Default
    private List<ProgressDTO> courseProgress = new ArrayList<>();
} 