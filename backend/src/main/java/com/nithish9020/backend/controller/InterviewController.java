package com.nithish9020.backend.controller;

import com.nithish9020.backend.dto.CreateInterviewRequest;
import com.nithish9020.backend.dto.CandidateDto;
import com.nithish9020.backend.service.InterviewService;
import com.nithish9020.backend.service.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
@Slf4j
public class InterviewController {
    private final InterviewService interviewService;
    private final JwtService jwtService;

    @PostMapping("/process-excel")
    public ResponseEntity<?> processExcel(@RequestParam("file") MultipartFile file) {
        try {
            log.info("Received Excel file: {}", file.getOriginalFilename());
            List<CandidateDto> candidates = interviewService.processExcelFile(file);
            log.info("Successfully processed {} candidates", candidates.size());

            // Return a structured response
            Map<String, Object> response = new HashMap<>();
            response.put("candidates", candidates);
            response.put("count", candidates.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error processing Excel file: ", e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createInterview(
            @RequestBody CreateInterviewRequest request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            log.info("Creating interview: {}", request.getInterviewName());
            // Change to use the correct method name from JwtService
            String createdBy = jwtService.getUsernameFromToken(authHeader.substring(7));
            String interviewId = interviewService.createInterview(request, createdBy);
            log.info("Interview created successfully with ID: {}", interviewId);
            return ResponseEntity.ok(Map.of("id", interviewId));
        } catch (Exception e) {
            log.error("Error creating interview: ", e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}