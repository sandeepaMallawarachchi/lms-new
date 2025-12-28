package com.learning.system.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class EmailService {
    
    @Autowired
    private JavaMailSender javaMailSender;
    
    @Value("${spring.mail.username}")
    private String senderEmail;
    
    @Value("${spring.mail.username}")
    private String adminEmail;
    
    /**
     * Send a simple text email
     */
    public void sendSimpleEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(senderEmail);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        
        javaMailSender.send(message);
    }
    
    /**
     * Send an HTML email
     */
    public void sendHtmlEmail(String to, String subject, String htmlBody) throws MessagingException {
        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        helper.setFrom(senderEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlBody, true);
        
        javaMailSender.send(message);
    }
    
    /**
     * Send a registration confirmation email
     */
    public void sendRegistrationConfirmationEmail(String to, String firstName, String username, String password) {
        String subject = "Welcome to LMS - Account Registration Confirmed";
        
        StringBuilder body = new StringBuilder();
        body.append("Dear ").append(firstName).append(",\n\n");
        body.append("Your registration has been approved! Your account is now active in our Learning Management System.\n\n");
        body.append("Here are your account details:\n");
        body.append("Username: ").append(username).append("\n");
        body.append("Password: ").append(password).append("\n\n");
        body.append("Please log in and change your password as soon as possible.\n\n");
        body.append("Best regards,\n");
        body.append("LMS Admin Team");
        
        sendSimpleEmail(to, subject, body.toString());
    }
    
    /**
     * Send an enrollment confirmation email
     */
    public void sendEnrollmentConfirmationEmail(String to, String firstName, String coursesInfo) {
        String subject = "Course Enrollment Confirmation";
        
        StringBuilder body = new StringBuilder();
        body.append("Dear ").append(firstName).append(",\n\n");
        body.append("Congratulations! You have been successfully enrolled in the following course(s):\n\n");
        body.append(coursesInfo).append("\n\n");
        body.append("You can now access these courses through your student dashboard.\n\n");
        body.append("Best regards,\n");
        body.append("LMS Admin Team");
        
        sendSimpleEmail(to, subject, body.toString());
    }
    
    /**
     * Send approval notification with HTML formatting
     */
    public void sendApprovalNotificationHtml(String to, String firstName, String coursesInfo, String username, String password) {
        String subject = "Your LMS Registration Has Been Approved!";
        
        StringBuilder htmlBody = new StringBuilder();
        htmlBody.append("<html><body style='font-family: Arial, sans-serif;'>");
        htmlBody.append("<div style='padding: 20px; background-color: #f5f5f5;'>");
        htmlBody.append("<h2 style='color: #4285f4;'>Registration Approved</h2>");
        htmlBody.append("<p>Dear <b>").append(firstName).append("</b>,</p>");
        htmlBody.append("<p>We're pleased to inform you that your registration has been approved!</p>");
        htmlBody.append("<div style='background-color: #ffffff; padding: 15px; border-radius: 5px; margin: 20px 0;'>");
        htmlBody.append("<h3 style='color: #34a853;'>Account Details</h3>");
        htmlBody.append("<p><b>Username:</b> ").append(username).append("</p>");
        htmlBody.append("<p><b>Password:</b> ").append(password).append("</p>");
        htmlBody.append("<p style='color: #ea4335;'><i>Please change your password after first login.</i></p>");
        htmlBody.append("</div>");
        htmlBody.append("<h3 style='color: #34a853;'>Enrolled Courses:</h3>");
        htmlBody.append("<div style='background-color: #ffffff; padding: 15px; border-radius: 5px;'>");
        htmlBody.append(coursesInfo.replace("\n", "<br>"));
        htmlBody.append("</div>");
        htmlBody.append("<p style='margin-top: 20px;'>You can now access these courses through your <a href='https://lms.rashinhanguk.com' style='color: #4285f4;'>student dashboard</a>.</p>");
        htmlBody.append("<p>Best regards,<br>LMS Admin Team</p>");
        htmlBody.append("</div></body></html>");
        
        try {
            sendHtmlEmail(to, subject, htmlBody.toString());
        } catch (MessagingException e) {
            // Fallback to plain text email if HTML fails
            sendRegistrationConfirmationEmail(to, firstName, username, password);
        }
    }
    
    /**
     * Send a request confirmation email with HTML formatting
     */
    public void sendRequestConfirmationEmail(String to, String firstName, String coursesInfo) {
        String subject = "Your Course Request Has Been Received";
        
        StringBuilder htmlBody = new StringBuilder();
        htmlBody.append("<html><body style='font-family: Arial, sans-serif;'>");
        htmlBody.append("<div style='padding: 20px; background-color: #f5f5f5;'>");
        htmlBody.append("<h2 style='color: #4285f4;'>Course Request Confirmation</h2>");
        htmlBody.append("<p>Dear <b>").append(firstName).append("</b>,</p>");
        htmlBody.append("<p>Thank you for submitting your course request. We have received your request and it is currently under review.</p>");
        
        htmlBody.append("<div style='background-color: #ffffff; padding: 15px; border-radius: 5px; margin: 20px 0;'>");
        htmlBody.append("<h3 style='color: #34a853;'>Request Details</h3>");
        htmlBody.append("<p><b>Request Date:</b> ").append(LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy HH:mm"))).append("</p>");
        htmlBody.append("<p><b>Status:</b> <span style='color: #fbbc05;'>Pending Review</span></p>");
        htmlBody.append("</div>");
        
        htmlBody.append("<h3 style='color: #34a853;'>Requested Courses:</h3>");
        htmlBody.append("<div style='background-color: #ffffff; padding: 15px; border-radius: 5px;'>");
        htmlBody.append(coursesInfo.replace("\n", "<br>"));
        htmlBody.append("</div>");
        
        htmlBody.append("<p style='margin-top: 20px;'>We will review your request and notify you once it has been processed.</p>");
        htmlBody.append("<p>If you have any questions, please don't hesitate to contact our support team.</p>");
        htmlBody.append("<p>Best regards,<br>LMS Admin Team</p>");
        htmlBody.append("</div></body></html>");
        
        try {
            sendHtmlEmail(to, subject, htmlBody.toString());
        } catch (MessagingException e) {
            // Fallback to plain text email if HTML fails
            StringBuilder body = new StringBuilder();
            body.append("Dear ").append(firstName).append(",\n\n");
            body.append("Thank you for submitting your course request. We have received your request for the following course(s):\n\n");
            body.append(coursesInfo).append("\n\n");
            body.append("Your request is currently under review. We will notify you once it has been processed.\n\n");
            body.append("Best regards,\n");
            body.append("LMS Admin Team");
            
            sendSimpleEmail(to, subject, body.toString());
        }
    }
    
    /**
     * Send an admin notification email with HTML formatting
     */
    public void sendAdminRequestNotificationEmail(String adminEmail, String studentName, String studentEmail, String coursesInfo) {
        String subject = "New Student Course Request Received";
        
        StringBuilder htmlBody = new StringBuilder();
        htmlBody.append("<html><body style='font-family: Arial, sans-serif;'>");
        htmlBody.append("<div style='padding: 20px; background-color: #f5f5f5;'>");
        htmlBody.append("<h2 style='color: #4285f4;'>New Course Request</h2>");
        htmlBody.append("<p>A new course request has been submitted by a student.</p>");
        
        htmlBody.append("<div style='background-color: #ffffff; padding: 15px; border-radius: 5px; margin: 20px 0;'>");
        htmlBody.append("<h3 style='color: #34a853;'>Student Information</h3>");
        htmlBody.append("<p><b>Name:</b> ").append(studentName).append("</p>");
        htmlBody.append("<p><b>Email:</b> ").append(studentEmail).append("</p>");
        htmlBody.append("<p><b>Request Date:</b> ").append(LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy HH:mm"))).append("</p>");
        htmlBody.append("<p><b>Status:</b> <span style='color: #fbbc05;'>Pending Review</span></p>");
        htmlBody.append("</div>");
        
        htmlBody.append("<h3 style='color: #34a853;'>Requested Courses:</h3>");
        htmlBody.append("<div style='background-color: #ffffff; padding: 15px; border-radius: 5px;'>");
        htmlBody.append(coursesInfo.replace("\n", "<br>"));
        htmlBody.append("</div>");
        
        htmlBody.append("<div style='margin-top: 20px; padding: 15px; background-color: #e8f0fe; border-radius: 5px;'>");
        htmlBody.append("<h3 style='color: #4285f4;'>Action Required</h3>");
        htmlBody.append("<p>Please review this request and take appropriate action:</p>");
        htmlBody.append("<ul>");
        htmlBody.append("<li>Review the student's information and requested courses</li>");
        htmlBody.append("<li>Verify course availability and prerequisites</li>");
        htmlBody.append("<li>Approve or reject the request through the admin dashboard</li>");
        htmlBody.append("</ul>");
        htmlBody.append("</div>");
        
        htmlBody.append("<p style='margin-top: 20px;'>Best regards,<br>LMS System</p>");
        htmlBody.append("</div></body></html>");
        
        try {
            sendHtmlEmail(adminEmail, subject, htmlBody.toString());
        } catch (MessagingException e) {
            // Fallback to plain text email if HTML fails
            StringBuilder body = new StringBuilder();
            body.append("Dear Admin,\n\n");
            body.append("A new course request has been submitted by a student.\n\n");
            body.append("Student Details:\n");
            body.append("Name: ").append(studentName).append("\n");
            body.append("Email: ").append(studentEmail).append("\n");
            body.append("Requested Courses:\n");
            body.append(coursesInfo).append("\n\n");
            body.append("Please review and process this request at your earliest convenience.\n\n");
            body.append("Best regards,\n");
            body.append("LMS System");
            
            sendSimpleEmail(adminEmail, subject, body.toString());
        }
    }
    
    /**
     * Send notification email to admin about a new course request
     */
    public void sendCourseRequestNotificationEmail(String studentEmail, String studentName, String coursesInfo, String reason) {
        try {
            String subject = "New Course Request from Student";
            
            String content = String.format("""
                <html>
                <body>
                    <h2>New Course Request</h2>
                    <p>A student has requested enrollment in the following courses:</p>
                    
                    <h3>Student Information:</h3>
                    <ul>
                        <li><strong>Name:</strong> %s</li>
                        <li><strong>Email:</strong> %s</li>
                    </ul>
                    
                    <h3>Requested Courses:</h3>
                    <pre>%s</pre>
                    
                    <h3>Reason for Request:</h3>
                    <p>%s</p>
                    
                    <p>Please review this request and take appropriate action.</p>
                    
                    <p>Best regards,<br>Learning Management System</p>
                </body>
                </html>
                """, studentName, studentEmail, coursesInfo, reason);
            
            sendHtmlEmail(adminEmail, subject, content);
        } catch (MessagingException e) {
            // Log the error but don't throw it to prevent disrupting the request flow
            e.printStackTrace();
        }
    }
    
    /**
     * Send approval notification email to student
     */
    public void sendCourseRequestApprovalEmail(String studentEmail, String studentName, String coursesInfo) {
        try {
            String subject = "Course Request Approved";
            
            String content = String.format("""
                <html>
                <body>
                    <h2>Course Request Approved</h2>
                    <p>Dear %s,</p>
                    
                    <p>Your request for the following courses has been approved:</p>
                    
                    <h3>Approved Courses:</h3>
                    <pre>%s</pre>
                    
                    <p>You can now access these courses in your dashboard.</p>
                    
                    <p>Best regards,<br>Learning Management System</p>
                </body>
                </html>
                """, studentName, coursesInfo);
            
            sendHtmlEmail(studentEmail, subject, content);
        } catch (MessagingException e) {
            // Log the error but don't throw it to prevent disrupting the request flow
            e.printStackTrace();
        }
    }
    
    /**
     * Send rejection notification email to student
     */
    public void sendCourseRequestRejectionEmail(String studentEmail, String studentName, String coursesInfo) {
        try {
            String subject = "Course Request Status Update";
            
            String content = String.format("""
                <html>
                <body>
                    <h2>Course Request Status Update</h2>
                    <p>Dear %s,</p>
                    
                    <p>We regret to inform you that your request for the following courses could not be approved at this time:</p>
                    
                    <h3>Requested Courses:</h3>
                    <pre>%s</pre>
                    
                    <p>If you have any questions, please contact the administration.</p>
                    
                    <p>Best regards,<br>Learning Management System</p>
                </body>
                </html>
                """, studentName, coursesInfo);
            
            sendHtmlEmail(studentEmail, subject, content);
        } catch (MessagingException e) {
            // Log the error but don't throw it to prevent disrupting the request flow
            e.printStackTrace();
        }
    }
    
    public void sendEnrollmentStatusChangeEmail(String to, String studentName, String courseName, String status) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Course Enrollment Status Update");
        message.setText(String.format(
            "Dear %s,\n\n" +
            "Your enrollment status for the course '%s' has been %s.\n\n" +
            "If you have any questions, please contact the administration.\n\n" +
            "Best regards,\n" +
            "Learning Management System Team",
            studentName,
            courseName,
            status
        ));
        
        javaMailSender.send(message);
    }
} 