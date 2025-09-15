package com.nithish9020.backend.controller;

import com.nithish9020.backend.dto.BookSlotRequest;
import com.nithish9020.backend.dto.CreateInterviewRequest;
import com.nithish9020.backend.dto.InterviewDto;
import com.nithish9020.backend.entity.Interview;
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

    @GetMapping("/my-interviews")
    public ResponseEntity<?> getMyInterviews(@RequestHeader("Authorization") String authHeader) {
        String createdBy = jwtService.getUsernameFromToken(authHeader.substring(7));
        List<Interview> interviews = interviewService.getInterviewsByCreator(createdBy);
        return ResponseEntity.ok(interviews);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteInterview(
            @PathVariable String id,
            @RequestHeader("Authorization") String authHeader) {
        String createdBy = jwtService.getUsernameFromToken(authHeader.substring(7));
        interviewService.deleteInterview(id, createdBy);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getInterviewById(
            @PathVariable String id,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String username = jwtService.getUsernameFromToken(authHeader.substring(7));
            Interview interview = interviewService.getInterviewById(id, username);
            return ResponseEntity.ok(interview);
        } catch (Exception e) {
            log.error("Error fetching interview: ", e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/available")
    public ResponseEntity<?> getAvailableInterviews(@RequestHeader("Authorization") String authHeader) {
        try {
            String email = jwtService.getUsernameFromToken(authHeader.substring(7));
            log.info("Fetching available interviews for user: {}", email);
            List<InterviewDto> interviews = interviewService.getAvailableInterviews(email);
            return ResponseEntity.ok(interviews);
        } catch (Exception e) {
            log.error("Error fetching available interviews: ", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/book")
    public ResponseEntity<?> bookSlot(
            @PathVariable String id,
            @RequestBody BookSlotRequest request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String email = jwtService.getUsernameFromToken(authHeader.substring(7));
            log.info("Booking slot for user: {} in interview: {}", email, id);
            interviewService.bookSlot(id, request.getDate(), request.getTimeSlot(), email);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error booking slot: ", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}