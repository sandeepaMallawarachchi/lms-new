package com.learning.system.controller;

import com.learning.system.dto.ChapterCreateDTO;
import com.learning.system.dto.ChapterCreationResponse;
import com.learning.system.entity.Chapter;
import com.learning.system.service.ChapterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/modules/{moduleId}/chapters")
public class ChapterController {
    @Autowired
    private ChapterService chapterService;

    @PostMapping
    public ResponseEntity<ChapterCreationResponse> createChapter(
            @PathVariable Long moduleId, 
            @RequestBody ChapterCreateDTO chapterDTO) {
        Chapter createdChapter = chapterService.createChapterWithDocument(chapterDTO, moduleId);
        
        // Map to DTO to avoid circular references
        ChapterCreationResponse response = ChapterCreationResponse.builder()
                .id(createdChapter.getId())
                .title(createdChapter.getTitle())
                .description(createdChapter.getDescription())
                .orderIndex(createdChapter.getOrderIndex())
                .isFree(createdChapter.isFree())
                .isVideoContent(true)
                .content(createdChapter.getContent())
                .youtubeLink(createdChapter.getYoutubeLink())
                .moduleId(createdChapter.getModule().getId())
                .moduleTitle(createdChapter.getModule().getTitle())
                .documents(createdChapter.getDocuments() != null ?
                        createdChapter.getDocuments().stream()
                                .map(doc -> ChapterCreationResponse.DocumentInfo.builder()
                                        .id(doc.getId())
                                        .url(doc.getUrl())
                                        .title(doc.getName())
                                        .type(doc.getType())
                                        .build())
                                .collect(Collectors.toList())
                        : null)
                .build();
                
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChapterCreationResponse> getChapterById(@PathVariable Long id) {
        Chapter chapter = chapterService.getChapterById(id);
        
        // Map to DTO to avoid circular references
        ChapterCreationResponse response = ChapterCreationResponse.builder()
                .id(chapter.getId())
                .title(chapter.getTitle())
                .description(chapter.getDescription())
                .orderIndex(chapter.getOrderIndex())
                .isFree(chapter.isFree())
                .isVideoContent(chapter.isVideoContent())
                .content(chapter.getContent())
                .youtubeLink(chapter.getYoutubeLink())
                .moduleId(chapter.getModule().getId())
                .moduleTitle(chapter.getModule().getTitle())
                .build();
                
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ChapterCreationResponse> updateChapter(
            @PathVariable Long id, 
            @RequestBody ChapterCreateDTO chapterDTO) {
        Chapter updatedChapter = chapterService.updateChapter(id, chapterDTO);
        
        // Map to DTO to avoid circular references
        ChapterCreationResponse response = ChapterCreationResponse.builder()
                .id(updatedChapter.getId())
                .title(updatedChapter.getTitle())
                .description(updatedChapter.getDescription())
                .orderIndex(updatedChapter.getOrderIndex())
                .isFree(updatedChapter.isFree())
                .isVideoContent(true)
                .content(updatedChapter.getContent())
                .youtubeLink(updatedChapter.getYoutubeLink())
                .moduleId(updatedChapter.getModule().getId())
                .moduleTitle(updatedChapter.getModule().getTitle())
                .documents(updatedChapter.getDocuments() != null ? 
                    updatedChapter.getDocuments().stream()
                        .map(doc -> ChapterCreationResponse.DocumentInfo.builder()
                            .id(doc.getId())
                            .url(doc.getUrl())
                            .title(doc.getName())
                            .type(doc.getType())
                            .build())
                        .collect(Collectors.toList())
                    : null)
                .build();
                
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteChapter(@PathVariable Long id) {
        chapterService.deleteChapter(id);
        return ResponseEntity.ok().build();
    }



//    @GetMapping("/free")
//    public ResponseEntity<List<Chapter>> getFreeChapters(@PathVariable Long moduleId) {
//        return ResponseEntity.ok(chapterService.getFreeChaptersByCourse(moduleId));
//    }
} 