package com.learning.system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CourseDetailResponse {
    private Long id;
    private String title;
    private String description;
    private int durationInWeeks;
    private BigDecimal fee;
    private List<ModuleResponse> modules;
    
    // Course Stats
    private int totalModules;
    private int totalChapters;
    private int freeChapters;
    private int videoChapters;
} 