package com.learning.system.service;

import com.learning.system.dto.CourseResponse;
import com.learning.system.entity.Course;
import com.learning.system.entity.User;
import com.learning.system.mapper.CourseMapper;
import com.learning.system.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CourseService {
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private CourseMapper courseMapper;

    public Course createCourse(Course course, User creator) {
        course.setCreatedBy(creator);
        course.setPublished(false);
        return courseRepository.save(course);
    }

    public CourseResponse getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        return courseMapper.toCourseResponse(course);
    }

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public List<Course> getCoursesByCreator(Long userId) {
        return courseRepository.findByCreatedBy_Id(userId);
    }

    public List<Course> getPublishedCourses() {
        return courseRepository.findByPublished(true);
    }

    public Course updateCourse(Course course) {
        if (!courseRepository.existsById(course.getId())) {
            throw new RuntimeException("Course not found");
        }
        Optional<Course> updatedCourse = courseRepository.findById(course.getId());
        if (updatedCourse.isPresent()) {
            updatedCourse.get().setPublished(course.isPublished());
            updatedCourse.get().setDescription(course.getDescription());
            updatedCourse.get().setTitle(course.getTitle());
            updatedCourse.get().setFee(course.getFee());
            return courseRepository.save(updatedCourse.get());

        }
        return updatedCourse.orElseThrow(() -> new RuntimeException("Course not found"));
    }

    public void deleteCourse(Long id) {
        courseRepository.deleteById(id);
    }

    public Course publishCourse(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        course.setPublished(true);
        return courseRepository.save(course);
    }

    public Course unpublishCourse(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        course.setPublished(false);
        return courseRepository.save(course);
    }
} 