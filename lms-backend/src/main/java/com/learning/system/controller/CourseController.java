package com.learning.system.controller;

import com.learning.system.dto.CourseResponse;
import com.learning.system.entity.Course;
import com.learning.system.entity.User;
import com.learning.system.mapper.CourseMapper;
import com.learning.system.service.CourseService;
import com.learning.system.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses")
public class CourseController {
    @Autowired
    private CourseService courseService;

    @Autowired
    private UserService userService;

    @Autowired
    private CourseMapper courseMapper;

    @PostMapping
    public ResponseEntity<CourseResponse> createCourse(@RequestBody Course course) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User creator = userService.getUserByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Course createdCourse = courseService.createCourse(course, creator);
        return ResponseEntity.ok(courseMapper.toCourseResponse(createdCourse));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseResponse> getCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    @GetMapping
    public ResponseEntity<List<CourseResponse>> getAllCourses() {
        List<Course> courses = courseService.getAllCourses();
        List<CourseResponse> courseResponses = courses.stream()
                .map(courseMapper::toCourseResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(courseResponses);
    }

    @GetMapping("/published")
    public ResponseEntity<List<CourseResponse>> getPublishedCourses() {
        List<Course> courses = courseService.getPublishedCourses();
        List<CourseResponse> courseResponses = courses.stream()
                .map(courseMapper::toCourseResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(courseResponses);
    }

    @GetMapping("/my-courses")
    public ResponseEntity<List<CourseResponse>> getMyCourses() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User creator = userService.getUserByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Course> courses = courseService.getCoursesByCreator(creator.getId());
        List<CourseResponse> courseResponses = courses.stream()
                .map(courseMapper::toCourseResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(courseResponses);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CourseResponse> updateCourse(@PathVariable Long id, @RequestBody Course course) {
        course.setId(id);
        Course updatedCourse = courseService.updateCourse(course);
        return ResponseEntity.ok(courseMapper.toCourseResponse(updatedCourse));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<CourseResponse> publishCourse(@PathVariable Long id) {
        Course publishedCourse = courseService.publishCourse(id);
        return ResponseEntity.ok(courseMapper.toCourseResponse(publishedCourse));
    }

    @PostMapping("/{id}/unpublish")
    public ResponseEntity<CourseResponse> unpublishCourse(@PathVariable Long id) {
        Course unpublishedCourse = courseService.unpublishCourse(id);
        return ResponseEntity.ok(courseMapper.toCourseResponse(unpublishedCourse));
    }
} 