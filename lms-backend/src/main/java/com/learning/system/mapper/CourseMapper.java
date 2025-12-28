package com.learning.system.mapper;

import com.learning.system.dto.*;
import com.learning.system.entity.*;
import com.learning.system.entity.Module;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class CourseMapper {

    public CourseResponse toCourseResponse(Course course) {
        return CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
//                .durationInWeeks(course.getDurationInWeeks())
                .fee(course.getFee())
                .numberOfModules(course.getNumberOfModules())
                .totalChapters(course.getTotalChapters())
                .freeChapters(course.getFreeChapters())
                .thumbnailUrl(course.getThumbnailUrl())
                .published(course.isPublished())
                .modules(course.getModules().stream()
                        .map(this::toModuleResponse)
                        .collect(Collectors.toList()))
                .build();
    }

    private ModuleResponse toModuleResponse(Module module) {
        return ModuleResponse.builder()
                .id(module.getId())
                .title(module.getTitle())
                .description(module.getDescription())
                .orderIndex(module.getOrderIndex())
                .chapters(module.getChapters().stream()
                        .map(this::toChapterResponse)
                        .collect(Collectors.toList()))
                .build();
    }

    private ChapterResponse toChapterResponse(Chapter chapter) {
        return ChapterResponse.builder()
                .id(chapter.getId())
                .title(chapter.getTitle())
                .description(chapter.getDescription())
                .isFree(chapter.isFree())
                .isVideoContent(chapter.isVideoContent())
                .orderIndex(chapter.getOrderIndex())
                .content(chapter.getContent())
                .youtubeLink(chapter.getYoutubeLink())
                .documents(chapter.getDocuments() != null ? 
                    chapter.getDocuments().stream()
                        .map(this::toDocumentResponse)
                        .collect(Collectors.toList()) 
                    : null)
                .build();
    }

    private DocumentResponse toDocumentResponse(Document document) {
        return DocumentResponse.builder()
                .id(document.getId())
                .name(document.getName())
                .url(document.getUrl())
                .size(document.getSize())
                .type(document.getType())
                .build();
    }

    public CourseDetailResponse toCourseDetailResponse(Course course) {
        return CourseDetailResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .durationInWeeks(course.getDurationInWeeks())
                .fee(course.getFee())
                .modules(course.getModules().stream()
                        .map(this::toModuleResponse)
                        .collect(Collectors.toList()))
                .totalModules(course.getNumberOfModules())
                .totalChapters(course.getTotalChapters())
                .freeChapters(course.getFreeChapters())
                .videoChapters((int) course.getModules().stream()
                        .flatMap(module -> module.getChapters().stream())
                        .filter(Chapter::isVideoContent)
                        .count())
                .build();
    }
} 