package com.canteen.service;

import com.canteen.entity.EmailLog;
import com.canteen.entity.Student;
import com.canteen.repository.EmailLogRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;

// Sends account emails and always logs the outcome, never the credential values
@Service
@RequiredArgsConstructor
public class EmailService {
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private final JavaMailSender mailSender;
    private final EmailLogRepository emailLogRepository;
    @Value("${app.frontend-url}")
    private String frontendUrl;

    public void sendWelcomeEmail(Student student, String username, String tempPassword) {
        String subject = "Welcome to the Student Canteen Management System";
        String body = String.format("""
                Welcome to the Student Canteen Management System.
                Dear %s,
                Your canteen portal account has been successfully created.
                Student ID: %s
                Username: %s
                Temporary Password: %s
                Portal Login URL: %s/login
                Please login to the Student Canteen Portal and change your password after your first login.
                For support, contact the canteen administration office.
                """, student.getName(), student.getStudentId(), username, tempPassword, frontendUrl);
        send(student, subject, body, "WELCOME");
    }

    public void sendCredentialResendEmail(Student student, String username, String newPassword) {
        String subject = "Your Canteen Portal Credentials";
        String body = String.format("""
                Dear %s,
                Here are your updated canteen portal login credentials.
                Student ID: %s
                Username: %s
                Temporary Password: %s
                Portal Login URL: %s/login
                """, student.getName(), student.getStudentId(), username, newPassword, frontendUrl);
        send(student, subject, body, "RESEND_CREDENTIALS");
    }

    /**
     * Sends the monthly wallet statement PDF as an attachment and logs the
     * outcome the same way every other student-facing email does.
     */
    public void sendStatementEmail(Student student, String monthLabel, byte[] pdfBytes) {
        String subject = "Canteen Wallet Statement - " + monthLabel;
        String body = String.format("""
                Dear %s,

                Please find attached your canteen wallet statement for %s.

                For any discrepancies, contact the canteen administration office.
                """, student.getName(), monthLabel);

        EmailLog.EmailLogBuilder logBuilder = EmailLog.builder()
                .student(student)
                .email(student.getEmail())
                .emailType("MONTHLY_STATEMENT");

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true);
            helper.setTo(student.getEmail());
            helper.setSubject(subject);
            helper.setText(body);
            helper.addAttachment("statement-" + monthLabel + ".pdf", new ByteArrayResource(pdfBytes));
            mailSender.send(mimeMessage);

            emailLogRepository.save(logBuilder.status("SUCCESS").build());
            log.info("Statement email sent to student {}", student.getStudentId());
        } catch (Exception e) {
            emailLogRepository.save(logBuilder.status("FAILED").errorMessage(e.getMessage()).build());
            log.error("Statement email failed for student {}: {}", student.getStudentId(), e.getMessage());
            throw new RuntimeException("Failed to send statement email", e);
        }
    }

    private void send(Student student, String subject, String body, String type) {
        EmailLog.EmailLogBuilder logBuilder = EmailLog.builder()
                .student(student)
                .email(student.getEmail())
                .emailType(type);
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(student.getEmail());
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            emailLogRepository.save(logBuilder.status("SUCCESS").build());
            log.info("Email of type {} sent to student {}", type, student.getStudentId());
        } catch (Exception e) {
            // Never log the email body (contains the temp password) - log only the failure
            emailLogRepository.save(logBuilder.status("FAILED").errorMessage(e.getMessage()).build());
            log.error("Email of type {} failed for student {}", type, student.getStudentId());
        }
    }

    public void sendEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }
}