package com.learning.system.service;

import com.learning.system.entity.Course;
import com.learning.system.entity.Module;
import com.learning.system.repository.CourseRepository;
import com.learning.system.repository.ModuleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ModuleService {
    @Autowired
    private ModuleRepository moduleRepository;

    @Autowired
    private CourseRepository courseRepository;

    public Module createModule(Module module, Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        module.setCourse(course);
        return moduleRepository.save(module);
    }

    public List<Module> getModulesByCourse(Long courseId) {
        return moduleRepository.findByCourse_IdOrderByOrderIndexAsc(courseId);
    }

    public Module updateModule(Module module) {
        if (!moduleRepository.existsById(module.getId())) {
            throw new RuntimeException("Module not found");
        }
        return moduleRepository.save(module);
    }

    public void deleteModule(Long id) {
        moduleRepository.deleteById(id);
    }

    public Module getModuleById(Long id) {
        return moduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Module not found"));
    }
} 