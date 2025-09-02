// 📂 dto/SignupRequest.java
package com.nithish9020.backend.dto;

import lombok.Data;

@Data
public class SignupRequest {
    private String name;
    private String email;
    private String password;
    private ROLE role;

    public enum ROLE {
        INTERVIEWER,
        APPLICANT
    }
}
