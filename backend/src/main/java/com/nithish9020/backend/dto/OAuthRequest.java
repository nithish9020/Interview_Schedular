package com.nithish9020.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OAuthRequest {
    private String code;
    private String provider; // "google" or "microsoft"
    private String role; // INTERVIEWER or APPLICANT
}

