package com.learning.system.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "chapter_progress")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChapterProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chapter_id", nullable = false)
    private Chapter chapter;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    /**
     * Progress percentage (0-100)
     */
    @Column(nullable = false)
    @Builder.Default
    private Integer progressPercentage = 0;
    
    /**
     * Time spent on this chapter in seconds
     */
    @Column(nullable = false)
    @Builder.Default
    private Integer timeSpentSeconds = 0;
    
    /**
     * Last timestamp when progress was updated
     */
    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime lastUpdated = LocalDateTime.now();
    
    /**
     * Whether the chapter is completed
     */
    @Column(nullable = false)
    @Builder.Default
    private boolean completed = false;
    
    public void updateProgress(int newProgressPercentage, int additionalTimeSpent) {
        // Update progress if it's higher than current progress
        if (newProgressPercentage > this.progressPercentage) {
            this.progressPercentage = newProgressPercentage;
        }
        
        // Add time spent
        this.timeSpentSeconds += additionalTimeSpent;
        
        // Mark as completed if progress is 100%
        if (this.progressPercentage >= 100) {
            this.completed = true;
        }
        
        // Update timestamp
        this.lastUpdated = LocalDateTime.now();
    }
} 