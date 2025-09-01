// src/main/java/com/nithish9020/backend/controller/AuthController.java
package com.nithish9020.backend.controller;

import com.nithish9020.backend.dto.SignupRequest;
import com.nithish9020.backend.dto.TempUser;
import com.nithish9020.backend.dto.VerifyOtpRequest;
import com.nithish9020.backend.entity.User;
import com.nithish9020.backend.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final OtpService otpService;
    private final EmailService emailService;
    private final JwtService jwtService;
    private final RedisService redisService; // Add RedisService

    // Step A: start signup -> create user (unverified), generate OTP, email it
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest req) {
        String email = req.getEmail().toLowerCase();

        if (userService.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body("❌ Email already registered");
        }

        // Hash password and store user data in Redis
        String passwordHash = userService.encodePassword(req.getPassword());
        redisService.saveTempUser(email, req.getName(), passwordHash); // implement this

        // generate OTP, store in Redis, send email
        String otp = otpService.generateOtp(email);
        emailService.sendOtp(email, otp);

        return ResponseEntity.ok("✅ Signup started. Check your email for the OTP (10 min).");
    }

    // Step B: verify OTP -> mark verified & return JWT for auto-login
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyOtpRequest req) {
        String email = req.getEmail().toLowerCase();
        boolean ok = otpService.verifyOtp(email, req.getCode());
        if (!ok)
            return ResponseEntity.badRequest().body("❌ Invalid or expired OTP");

        // Get user data from Redis and save to DB
        TempUser tempUser = redisService.getTempUser(email); // implement this
        if (tempUser == null)
            return ResponseEntity.badRequest().body("❌ Signup expired. Please try again.");

        User savedUser = userService.createLocalUser(tempUser.getName(), email, tempUser.getPasswordHash());
        userService.markVerified(email);
        redisService.deleteTempUser(email);

        String token = jwtService.generateToken(email);
        return ResponseEntity.ok(new AuthResponse("✅ Email verified. Logged in", token));
    }

    // Optional: login endpoint (email+password) - returns JWT if verified already
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody SignupRequest req) {
        String email = req.getEmail().toLowerCase();
        if (!userService.authenticate(email, req.getPassword())) {
            return ResponseEntity.badRequest().body("❌ Invalid credentials");
        }
        // Ensure email verified
        User user = userService.findByEmail(email).orElseThrow();
        if (!user.isEmailVerified()) {
            return ResponseEntity.badRequest().body("❌ Email not verified");
        }
        String token = jwtService.generateToken(email);
        return ResponseEntity.ok(new AuthResponse("✅ Login successful", token));
    }

    // Simple response DTO inline
    record AuthResponse(String message, String token) {
    }
}
