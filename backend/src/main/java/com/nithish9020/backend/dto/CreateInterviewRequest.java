package com.nithish9020.backend.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
public class CreateInterviewRequest {
    private String interviewName;
    private LocalDate fromDate;
    private LocalDate toDate;
    private Map<String, Map<String, String>> timeSlots; // date -> {time -> applicantEmail}
    private List<CandidateDto> candidates;
}