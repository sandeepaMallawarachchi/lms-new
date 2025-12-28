package com.learning.system.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "chapters")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Chapter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 1000)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", nullable = false)
    private Module module;

    @Column(nullable = false)
    private Integer orderIndex;

    @Column(nullable = false)
    @Builder.Default
    private boolean isFree = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean isVideoContent = true;

    @Column(length = 1000)
    private String videoUrl;

    @Column(length = 1000)
    private String content;

    @Column(length = 1000)
    private String youtubeLink;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "document_id")
    private Document document;

    @OneToMany(mappedBy = "chapter", cascade = CascadeType.ALL)
    private List<Document> documents;
    
    @ManyToMany
    @JoinTable(
        name = "chapter_completions",
        joinColumns = @JoinColumn(name = "chapter_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @Builder.Default
    private List<User> completedByUsers = new ArrayList<>();
    
    @OneToMany(mappedBy = "chapter", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ChapterProgress> chapterProgresses = new ArrayList<>();
} 