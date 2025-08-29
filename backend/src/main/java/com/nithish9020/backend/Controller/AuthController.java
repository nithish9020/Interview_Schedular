package com.nithish9020.backend.Controller;

import com.nithish9020.backend.Service.UserService;
import com.nithish9020.backend.modal.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173") // allow frontend (Vite)

public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        // ✅ validate email format
        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";
        if (!Pattern.matches(emailRegex, user.getEmail())) {
            return ResponseEntity.badRequest().body("❌ Invalid email format");
        }

        // ✅ check if email exists
        if (userService.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("❌ Email already exists");
        }

        // ✅ save user
        userService.saveUser(user);
        return ResponseEntity.ok("✅ User registered successfully");
    }
}
