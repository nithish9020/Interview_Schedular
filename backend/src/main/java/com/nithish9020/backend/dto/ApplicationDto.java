package com.nithish9020.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ApplicationDto {
    private String id;
    private String interviewName;
    private String interviewDate;
    private String timeSlot;
    private String status;
    private String interviewer;
    private LocalDateTime createdAt;
}