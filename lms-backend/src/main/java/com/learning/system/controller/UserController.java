package com.learning.system.controller;

import com.learning.system.dto.ProgressDTO;
import com.learning.system.dto.StudentDetailDTO;
import com.learning.system.dto.StudentProfileDTO;
import com.learning.system.dto.UserResponse;
import com.learning.system.entity.User;
import com.learning.system.service.StudentDetailService;
import com.learning.system.service.StudentProfileService;
import com.learning.system.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class UserController {
    @Autowired
    private UserService userService;
    @Autowired
    private StudentDetailService studentDetailService;


    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        return ResponseEntity.ok(userService.createUser(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/current")
    public ResponseEntity<UserResponse> getCurrentUser() {
        // Get the authenticated user from the security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User user =userService.getUserByUsername(username).orElse(null);


        boolean isAdmin = user.getRoles().stream()
                .anyMatch(role -> role.getName().equals("ROLE_ADMIN"));

        UserResponse.UserResponseBuilder responseBuilder = UserResponse.builder()
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .roles(user.getRoles())
                .email(user.getEmail());

        if (!isAdmin) {
            StudentDetailDTO userProfile = studentDetailService.getStudentDetailByUserId(user.getId());
            responseBuilder.profileImage(userProfile.getProfileImage());
        }

        UserResponse response = responseBuilder.build();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        user.setId(id);
        return ResponseEntity.ok(userService.updateUser(user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }
} 