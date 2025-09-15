package com.nithish9020.backend.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class InterviewDto {
    private String id;
    private String interviewName;
    private String fromDate; // Changed to String to match frontend expectation
    private String toDate; // Changed to String to match frontend expectation
    private Map<String, List<String>> availableSlots;
    private String createdBy;
}