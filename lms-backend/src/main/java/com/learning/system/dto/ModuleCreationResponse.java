package com.learning.system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for Module creation response to avoid circular reference issues
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModuleCreationResponse {
    private Long id;
    private String title;
    private String description;
    private Integer orderIndex;
    private Long courseId;
    private String courseTitle;
    // We don't include the full Course object or chapters to prevent circular references
} 