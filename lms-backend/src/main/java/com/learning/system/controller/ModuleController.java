package com.learning.system.controller;

import com.learning.system.dto.ModuleCreationResponse;
import com.learning.system.entity.Module;
import com.learning.system.service.ModuleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses/{courseId}/modules")
public class ModuleController {
    @Autowired
    private ModuleService moduleService;

    @PostMapping
    public ResponseEntity<ModuleCreationResponse> createModule(@PathVariable Long courseId, @RequestBody Module module) {
        Module createdModule = moduleService.createModule(module, courseId);
        
        // Map to DTO to avoid circular references
        ModuleCreationResponse response = ModuleCreationResponse.builder()
                .id(createdModule.getId())
                .title(createdModule.getTitle())
                .description(createdModule.getDescription())
                .orderIndex(createdModule.getOrderIndex())
                .courseId(createdModule.getCourse().getId())
                .courseTitle(createdModule.getCourse().getTitle())
                .build();
                
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<Module>> getModulesByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(moduleService.getModulesByCourse(courseId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Module> getModuleById(@PathVariable Long id) {
        return ResponseEntity.ok(moduleService.getModuleById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Module> updateModule(@PathVariable Long id, @RequestBody Module module) {
        module.setId(id);
        return ResponseEntity.ok(moduleService.updateModule(module));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteModule(@PathVariable Long id) {
        moduleService.deleteModule(id);
        return ResponseEntity.ok().build();
    }
} 