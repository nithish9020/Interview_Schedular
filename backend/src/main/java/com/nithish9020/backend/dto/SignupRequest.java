// 📂 dto/SignupRequest.java
package com.nithish9020.backend.dto;

import com.fasterxml.jackson.annotation.JsonCreator;

import lombok.Data;

@Data
public class SignupRequest {
    private String name;
    private String email;
    private String password;
    private ROLE role;

    public enum ROLE {
        INTERVIEWER,
        APPLICANT;

        @JsonCreator
        public static ROLE fromString(String value) {
            if (value == null)
                return null;
            switch (value.toUpperCase()) {
                case "INTERVIEWER":
                    return INTERVIEWER;
                case "APPLICANT":
                    return APPLICANT;
                case "DEFAULT":
                    return APPLICANT; // 👈 decide how to map
                default:
                    throw new IllegalArgumentException("Invalid role: " + value);
            }
        }
    }
    
}
