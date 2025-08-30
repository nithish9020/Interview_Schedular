// 📂 src/main/java/com/nithish9020/backend/service/EmailService.java
package com.nithish9020.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * EmailService handles sending OTP and notification emails
 * using Gmail SMTP (configured in application.properties).
 */
@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    /**
     * Sends an OTP email to the user.
     *
     * @param toEmail recipient email address
     * @param otp     one-time password to be sent
     */
    public void sendOtp(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Your OTP Code - Interview Scheduler");
        message.setText("Hello,\n\nYour OTP is: " + otp +
                        "\nThis code will expire in 5 minutes.\n\n" +
                        "If you did not request this, please ignore.\n\n" +
                        "Best Regards,\nInterview Scheduler Team");

        mailSender.send(message);
    }

    /**
     * Sends a generic email.
     *
     * @param toEmail recipient email address
     * @param subject subject of the email
     * @param body    body of the email
     */
    public void sendEmail(String toEmail, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(body);

        mailSender.send(message);
    }
}
