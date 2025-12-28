package com.learning.system.controller;

import com.learning.system.service.EmailService;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Test controller for email functionality
 * Note: This should be removed or secured in production
 */
@RestController
@RequestMapping("/api/test/email")
@PreAuthorize("permitAll()")
public class EmailTestController {

    @Autowired
    private EmailService emailService;
    
    @GetMapping("/send-simple")
    public ResponseEntity<String> testSimpleEmail(
            @RequestParam String to,
            @RequestParam String subject,
            @RequestParam String body) {
        
        emailService.sendSimpleEmail(to, subject, body);
        return ResponseEntity.ok("Simple email sent to " + to);
    }
    
    @GetMapping("/send-html")
    public ResponseEntity<String> testHtmlEmail(
            @RequestParam String to,
            @RequestParam String subject,
            @RequestParam String body) {
        
        try {
            emailService.sendHtmlEmail(to, subject, body);
            return ResponseEntity.ok("HTML email sent to " + to);
        } catch (MessagingException e) {
            return ResponseEntity.internalServerError().body("Failed to send email: " + e.getMessage());
        }
    }
    
    @GetMapping("/send-approval")
    public ResponseEntity<String> testApprovalEmail(
            @RequestParam String to,
            @RequestParam String firstName,
            @RequestParam String coursesInfo,
            @RequestParam String username,
            @RequestParam String password) {
        
        emailService.sendApprovalNotificationHtml(to, firstName, coursesInfo, username, password);
        return ResponseEntity.ok("Approval notification sent to " + to);
    }
} 