package com.nithish9020.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OAuthUserInfo {
    private String id;
    private String email;
    private String name;
    private String provider; // "google" or "microsoft"
    private boolean verified_email;
}