// src/main/java/com/nithish9020/backend/entity/User.java
package com.nithish9020.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

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

    @Column(nullable=false)
    private boolean emailVerified = false;

    private Instant createdAt;
}
