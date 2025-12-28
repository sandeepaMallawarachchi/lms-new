package com.learning.system.repository;

import com.learning.system.entity.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ModuleRepository extends JpaRepository<Module, Long> {
    List<Module> findByCourse_Id(Long courseId);
    List<Module> findByCourse_IdOrderByOrderIndexAsc(Long courseId);
} 