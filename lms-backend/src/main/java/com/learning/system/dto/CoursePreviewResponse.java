package com.learning.system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CoursePreviewResponse {
    private Long id;
    private String title;
    private String description;
    private int durationInWeeks;
    private BigDecimal fee;
    private int numberOfModules;
    private int totalChapters;
    private int freeChapters;
    private boolean hasAssessment;
    private String thumbnailUrl;
} 