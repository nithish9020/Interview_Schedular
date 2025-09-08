// 📂 dto/LoginRequest.java
package com.nithish9020.backend.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}
