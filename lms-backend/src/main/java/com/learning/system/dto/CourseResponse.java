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
public class CourseResponse {
    private Long id;
    private String title;
    private String description;
    private int durationInWeeks;
    private BigDecimal fee;
    private int numberOfModules;
    private int totalChapters;
    private int freeChapters;
    private String thumbnailUrl;
    private List<ModuleResponse> modules;
    private boolean published;
} 