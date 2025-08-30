// src/main/java/com/nithish9020/backend/dto/VerifyOtpRequest.java
package com.nithish9020.backend.dto;

import lombok.Data;

@Data
public class VerifyOtpRequest {
    private String email;
    private String code;
}
