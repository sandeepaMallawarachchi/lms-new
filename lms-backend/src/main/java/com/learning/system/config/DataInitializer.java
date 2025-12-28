package com.learning.system.config;

import com.learning.system.entity.Permission;
import com.learning.system.entity.Role;
import com.learning.system.repository.PermissionRepository;
import com.learning.system.repository.RoleRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataInitializer {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    @PostConstruct
    public void init() {
        // Create permissions
        Set<Permission> permissions = new HashSet<>(Arrays.asList(
            createPermissionIfNotFound("COURSE_CREATE", "Create new courses"),
            createPermissionIfNotFound("COURSE_READ", "View courses"),
            createPermissionIfNotFound("COURSE_UPDATE", "Update courses"),
            createPermissionIfNotFound("COURSE_DELETE", "Delete courses"),
            createPermissionIfNotFound("MODULE_CREATE", "Create modules"),
            createPermissionIfNotFound("MODULE_READ", "View modules"),
            createPermissionIfNotFound("MODULE_UPDATE", "Update modules"),
            createPermissionIfNotFound("MODULE_DELETE", "Delete modules"),
            createPermissionIfNotFound("CHAPTER_CREATE", "Create chapters"),
            createPermissionIfNotFound("CHAPTER_READ", "View chapters"),
            createPermissionIfNotFound("CHAPTER_UPDATE", "Update chapters"),
            createPermissionIfNotFound("CHAPTER_DELETE", "Delete chapters"),
            createPermissionIfNotFound("USER_MANAGE", "Manage users")
        ));

        // Create roles with permissions
        createRoleIfNotFound("ROLE_ADMIN", Set.of(
            "COURSE_CREATE", "COURSE_READ", "COURSE_UPDATE", "COURSE_DELETE",
            "MODULE_CREATE", "MODULE_READ", "MODULE_UPDATE", "MODULE_DELETE",
            "CHAPTER_CREATE", "CHAPTER_READ", "CHAPTER_UPDATE", "CHAPTER_DELETE",
            "USER_MANAGE"
        ));

        createRoleIfNotFound("ROLE_INSTRUCTOR", Set.of(
            "COURSE_CREATE", "COURSE_READ", "COURSE_UPDATE", "COURSE_DELETE",
            "MODULE_CREATE", "MODULE_READ", "MODULE_UPDATE", "MODULE_DELETE",
            "CHAPTER_CREATE", "CHAPTER_READ", "CHAPTER_UPDATE", "CHAPTER_DELETE"
        ));

        createRoleIfNotFound("ROLE_STUDENT", Set.of(
            "COURSE_READ", "MODULE_READ", "CHAPTER_READ"
        ));
    }

    private Permission createPermissionIfNotFound(String name, String description) {
        return permissionRepository.findByName(name)
                .orElseGet(() -> {
                    Permission permission = new Permission();
                    permission.setName(name);
                    permission.setDescription(description);
                    return permissionRepository.save(permission);
                });
    }

    private void createRoleIfNotFound(String name, Set<String> permissionNames) {
        if (!roleRepository.existsByName(name)) {
            Role role = new Role();
            role.setName(name);
            
            Set<Permission> permissions = permissionRepository.findByNameIn(permissionNames);
            role.setPermissions(permissions);
            
            roleRepository.save(role);
        }
    }
} 