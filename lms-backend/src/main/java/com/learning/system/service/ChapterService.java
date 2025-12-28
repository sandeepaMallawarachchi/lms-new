package com.learning.system.service;

import com.learning.system.dto.ChapterCreateDTO;
import com.learning.system.entity.Chapter;
import com.learning.system.entity.Course;
import com.learning.system.entity.Document;
import com.learning.system.entity.Module;
import com.learning.system.exception.ResourceNotFoundException;
import com.learning.system.repository.ChapterRepository;
import com.learning.system.repository.CourseRepository;
import com.learning.system.repository.DocumentRepository;
import com.learning.system.repository.ModuleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChapterService {
    @Autowired
    private ChapterRepository chapterRepository;

    @Autowired
    private ModuleRepository moduleRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private DocumentRepository documentRepository;

    public Chapter createChapter(Chapter chapter, Long moduleId) {
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new RuntimeException("Module not found"));
        chapter.setModule(module);
        return chapterRepository.save(chapter);
    }



//    public List<Chapter> getFreeChaptersByCourse(Long courseId) {
//        return chapterRepository.findByModule_Course_IdAndFreeIsTrue(courseId);
//    }

    @Transactional
    public Chapter updateChapter(Long chapterId, ChapterCreateDTO chapterDTO) {
        // Get the existing chapter
        Chapter existingChapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new RuntimeException("Chapter not found"));
        
        // Update basic chapter fields
        existingChapter.setTitle(chapterDTO.getTitle());
        existingChapter.setDescription(chapterDTO.getDescription());
        existingChapter.setContent(chapterDTO.getContent());
        existingChapter.setFree(chapterDTO.isFree());
        existingChapter.setOrderIndex(chapterDTO.getOrderIndex());
        existingChapter.setVideoContent(chapterDTO.isVideoContent());
        existingChapter.setYoutubeLink(chapterDTO.getYoutubeLink());
        
        // Handle documents update
        if (chapterDTO.getDocuments() != null) {
            // Delete existing documents from the database
            if (existingChapter.getDocuments() != null) {
                documentRepository.deleteAll(existingChapter.getDocuments());
                existingChapter.getDocuments().clear();
            }
            
            // Create and add new documents
            List<Document> newDocuments = chapterDTO.getDocuments().stream()
                .map(docDTO -> {
                    Document doc = new Document();
                    doc.setName(docDTO.getName());
                    doc.setUrl(docDTO.getUrl());
                    doc.setType(docDTO.getType());
                    doc.setSize(docDTO.getSize());
                    doc.setChapter(existingChapter);
                    return documentRepository.save(doc); // Save each document individually
                })
                .collect(Collectors.toList());
            
            existingChapter.setDocuments(newDocuments);
        } else {
            // If no documents provided in update, remove all existing documents
            if (existingChapter.getDocuments() != null) {
                documentRepository.deleteAll(existingChapter.getDocuments());
                existingChapter.getDocuments().clear();
            }
        }
        
        return chapterRepository.save(existingChapter);
    }

    public void deleteChapter(Long id) {
        chapterRepository.deleteById(id);
    }

    public Chapter getChapterById(Long id) {
        return chapterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Chapter not found"));
    }

    /**
     * Create a new chapter with optional document
     * 
     * @param chapterDTO The chapter creation DTO
     * @param moduleId The module ID
     * @return The created chapter
     */
    @Transactional
    public Chapter createChapterWithDocument(ChapterCreateDTO chapterDTO, Long moduleId) {
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new RuntimeException("Module not found"));
        
        Chapter chapter = new Chapter();
        chapter.setTitle(chapterDTO.getTitle());
        chapter.setDescription(chapterDTO.getDescription());
        chapter.setContent(chapterDTO.getContent());
        chapter.setFree(chapterDTO.isFree());
        chapter.setOrderIndex(chapterDTO.getOrderIndex());
        chapter.setYoutubeLink(chapterDTO.getYoutubeLink());
        chapter.setVideoContent(chapterDTO.isVideoContent());
        chapter.setModule(module);
        
        // Handle documents if provided
        if (chapterDTO.getDocuments() != null && !chapterDTO.getDocuments().isEmpty()) {
            List<Document> documents = chapterDTO.getDocuments().stream()
                .map(docDTO -> {
                    Document doc = new Document();
                    doc.setName(docDTO.getName());
                    doc.setUrl(docDTO.getUrl());
                    doc.setType(docDTO.getType());
                    doc.setSize(docDTO.getSize());
                    doc.setChapter(chapter);
                    return doc;
                })
                .collect(Collectors.toList());
            
            chapter.setDocuments(documents);
        }
        
        // Handle video content
        if (chapterDTO.isVideoContent() && chapterDTO.getYoutubeLink() != null) {
            chapter.setYoutubeLink(chapterDTO.getYoutubeLink());
        }
        
        return chapterRepository.save(chapter);
    }
} 