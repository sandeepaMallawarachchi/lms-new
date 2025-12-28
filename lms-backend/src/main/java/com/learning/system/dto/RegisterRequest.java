package com.learning.system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    private String username;
    private String password;
    private String email;
    private String firstName = "";
    private String lastName = "";
    private String contactNumber = "";
    private boolean active = true;
    private String role; // ROLE_ADMIN, ROLE_INSTRUCTOR, or ROLE_STUDENT
} 