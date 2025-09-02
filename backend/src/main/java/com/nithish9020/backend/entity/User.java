// src/main/java/com/nithish9020/backend/entity/User.java
package com.nithish9020.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

import com.nithish9020.backend.dto.SignupRequest.ROLE;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique=true, nullable=false)
    private String email;

    @Column(nullable=false)
    private String name;

    @Column(nullable=false)
    private String passwordHash; // BCrypt hashed password

    @Builder.Default
    @Column(nullable=false)
    private boolean emailVerified = false;

    private Instant createdAt;
    
    @Column(nullable=false)
    private ROLE role;
}
