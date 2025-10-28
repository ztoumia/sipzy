package com.sipzy.notification.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

/**
 * Email Service for sending notifications
 *
 * Supports:
 * - Welcome emails on registration
 * - Coffee approval/rejection notifications
 * - Review notifications
 * - Password reset emails
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@sipzy.coffee}")
    private String fromEmail;

    @Value("${app.name:Sipzy}")
    private String appName;

    @Value("${app.url:http://localhost:3000}")
    private String appUrl;

    /**
     * Send a simple text email
     */
    @Async
    public void sendSimpleEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);

            mailSender.send(message);
            log.info("Simple email sent to: {}", to);
        } catch (MailException e) {
            log.error("Failed to send email to: {}", to, e);
        }
    }

    /**
     * Send an HTML email
     */
    @Async
    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("HTML email sent to: {}", to);
        } catch (MessagingException | MailException e) {
            log.error("Failed to send HTML email to: {}", to, e);
        }
    }

    /**
     * Send welcome email to new users
     */
    public void sendWelcomeEmail(String to, String username) {
        String subject = "Welcome to " + appName + "!";
        String htmlContent = buildWelcomeEmail(username);
        sendHtmlEmail(to, subject, htmlContent);
    }

    /**
     * Send coffee approval notification
     */
    public void sendCoffeeApprovedEmail(String to, String username, String coffeeName) {
        String subject = "Your coffee has been approved!";
        String htmlContent = buildCoffeeApprovedEmail(username, coffeeName);
        sendHtmlEmail(to, subject, htmlContent);
    }

    /**
     * Send coffee rejection notification
     */
    public void sendCoffeeRejectedEmail(String to, String username, String coffeeName, String reason) {
        String subject = "Update on your coffee submission";
        String htmlContent = buildCoffeeRejectedEmail(username, coffeeName, reason);
        sendHtmlEmail(to, subject, htmlContent);
    }

    /**
     * Send new review notification to coffee submitter
     */
    public void sendNewReviewEmail(String to, String username, String coffeeName, int rating) {
        String subject = "New review on your coffee!";
        String htmlContent = buildNewReviewEmail(username, coffeeName, rating);
        sendHtmlEmail(to, subject, htmlContent);
    }

    /**
     * Send password reset email
     */
    public void sendPasswordResetEmail(String to, String username, String resetToken) {
        String subject = "Reset your " + appName + " password";
        String resetLink = appUrl + "/reset-password?token=" + resetToken;
        String htmlContent = buildPasswordResetEmail(username, resetLink);
        sendHtmlEmail(to, subject, htmlContent);
    }

    // ==================== HTML Email Templates ====================

    private String buildWelcomeEmail(String username) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #6B4423; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background: #f9f9f9; }
                    .button { display: inline-block; padding: 12px 24px; background: #6B4423;
                              color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to """ + appName + """
            !</h1>
                    </div>
                    <div class="content">
                        <p>Hi <strong>""" + username + """
            </strong>,</p>
                        <p>Welcome to """ + appName + """
            , the community for coffee lovers!</p>
                        <p>You can now:</p>
                        <ul>
                            <li>Discover amazing coffees from around the world</li>
                            <li>Share your own coffee discoveries</li>
                            <li>Write reviews and help others find great coffee</li>
                            <li>Connect with fellow coffee enthusiasts</li>
                        </ul>
                        <center>
                            <a href=\"""" + appUrl + """
            " class="button">Start Exploring</a>
                        </center>
                    </div>
                    <div class="footer">
                        <p>&copy; 2024 """ + appName + """
            . All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """;
    }

    private String buildCoffeeApprovedEmail(String username, String coffeeName) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #22C55E; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background: #f9f9f9; }
                    .button { display: inline-block; padding: 12px 24px; background: #6B4423;
                              color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Coffee Approved!</h1>
                    </div>
                    <div class="content">
                        <p>Hi <strong>""" + username + """
            </strong>,</p>
                        <p>Great news! Your coffee submission has been approved:</p>
                        <h2 style="color: #6B4423;">""" + coffeeName + """
            </h2>
                        <p>Your coffee is now live on """ + appName + """
             and visible to all users!</p>
                        <center>
                            <a href=\"""" + appUrl + """
            /coffees" class="button">View Your Coffee</a>
                        </center>
                    </div>
                    <div class="footer">
                        <p>&copy; 2024 """ + appName + """
            . All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """;
    }

    private String buildCoffeeRejectedEmail(String username, String coffeeName, String reason) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #EF4444; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background: #f9f9f9; }
                    .reason { background: #FEE2E2; padding: 15px; border-left: 4px solid #EF4444; margin: 15px 0; }
                    .button { display: inline-block; padding: 12px 24px; background: #6B4423;
                              color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Update on Your Coffee Submission</h1>
                    </div>
                    <div class="content">
                        <p>Hi <strong>""" + username + """
            </strong>,</p>
                        <p>Thank you for submitting your coffee to """ + appName + """
            :</p>
                        <h3 style="color: #6B4423;">""" + coffeeName + """
            </h3>
                        <p>Unfortunately, we couldn't approve it at this time. Here's why:</p>
                        <div class="reason">
                            <strong>Reason:</strong> """ + (reason != null ? reason : "Not specified") + """

                        </div>
                        <p>Please feel free to resubmit with the necessary corrections!</p>
                        <center>
                            <a href=\"""" + appUrl + """
            /submit" class="button">Submit Again</a>
                        </center>
                    </div>
                    <div class="footer">
                        <p>&copy; 2024 """ + appName + """
            . All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """;
    }

    private String buildNewReviewEmail(String username, String coffeeName, int rating) {
        String stars = "⭐".repeat(rating);
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #6B4423; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background: #f9f9f9; }
                    .rating { font-size: 24px; margin: 15px 0; }
                    .button { display: inline-block; padding: 12px 24px; background: #6B4423;
                              color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>New Review!</h1>
                    </div>
                    <div class="content">
                        <p>Hi <strong>""" + username + """
            </strong>,</p>
                        <p>Someone just reviewed your coffee:</p>
                        <h3 style="color: #6B4423;">""" + coffeeName + """
            </h3>
                        <div class="rating">""" + stars + """
            </div>
                        <center>
                            <a href=\"""" + appUrl + """
            /coffees" class="button">View Review</a>
                        </center>
                    </div>
                    <div class="footer">
                        <p>&copy; 2024 """ + appName + """
            . All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """;
    }

    private String buildPasswordResetEmail(String username, String resetLink) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #6B4423; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background: #f9f9f9; }
                    .button { display: inline-block; padding: 12px 24px; background: #6B4423;
                              color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
                    .warning { background: #FEF3C7; padding: 15px; border-left: 4px solid #F59E0B; margin: 15px 0; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Reset Your Password</h1>
                    </div>
                    <div class="content">
                        <p>Hi <strong>""" + username + """
            </strong>,</p>
                        <p>We received a request to reset your password. Click the button below to create a new password:</p>
                        <center>
                            <a href=\"""" + resetLink + """
            " class="button">Reset Password</a>
                        </center>
                        <div class="warning">
                            <strong>Security Note:</strong> This link will expire in 1 hour.
                            If you didn't request this, please ignore this email.
                        </div>
                    </div>
                    <div class="footer">
                        <p>&copy; 2024 """ + appName + """
            . All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """;
    }
}
