package com.nithish9020.backend.dto;

import com.nithish9020.backend.dto.SignupRequest.ROLE;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TempUser {
    private String name;
    private String email;
    private String passwordHash;
    private ROLE role;
}