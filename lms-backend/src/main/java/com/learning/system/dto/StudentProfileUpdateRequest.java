package com.learning.system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO for updating student profile information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfileUpdateRequest {
    private String fullName;
    private String contactNumber;
    private String address;
    private LocalDate dateOfBirth;
    private String emergencyContactName;
    private String emergencyContactRelation;
    private String emergencyContactPhone;
    private String bio;
    
    // Base64 encoded profile image string (if updating)
    private String profileImageBase64;
} 