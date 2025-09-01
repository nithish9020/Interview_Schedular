// src/main/java/com/nithish9020/backend/service/UserService.java
package com.nithish9020.backend.service;

import com.nithish9020.backend.entity.User;
import com.nithish9020.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository repo, PasswordEncoder encoder) {
        this.userRepository = repo;
        this.passwordEncoder = encoder;
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // Create user with hashed password and emailVerified=false
    public User createLocalUser(String name, String email, String rawPassword) {
        User u = User.builder()
                .name(name)
                .email(email.toLowerCase())
                .passwordHash(rawPassword)
                .emailVerified(false)
                .createdAt(Instant.now())
                .build();
        return userRepository.save(u);
    }

    public void markVerified(String email) {
        userRepository.findByEmail(email).ifPresent(u -> {
            u.setEmailVerified(true);
            userRepository.save(u);
        });
    }

    // Authenticate with email + password (used for login)
    public boolean authenticate(String email, String rawPassword) {
        return userRepository.findByEmail(email)
                .map(u -> passwordEncoder.matches(rawPassword, u.getPasswordHash()))
                .orElse(false);
    }

    public String encodePassword(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }
}
