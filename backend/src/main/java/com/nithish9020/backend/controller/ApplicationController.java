package com.nithish9020.backend.controller;

import com.nithish9020.backend.dto.ApplicationDto;
import com.nithish9020.backend.service.ApplicationService;
import com.nithish9020.backend.service.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
@Slf4j
public class ApplicationController {
    private final ApplicationService applicationService;
    private final JwtService jwtService;

    @GetMapping("/my-applications")
    public ResponseEntity<?> getMyApplications(@RequestHeader("Authorization") String authHeader) {
        try {
            String email = jwtService.getUsernameFromToken(authHeader.substring(7));
            log.info("Fetching applications for user: {}", email);

            List<ApplicationDto> applications = applicationService.getMyApplications(email);
            Map<String, Object> response = Map.of(
                    "applications", applications,
                    "stats", applicationService.getApplicationStats(applications));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching applications: ", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getApplicationById(
            @PathVariable String id,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String email = jwtService.getUsernameFromToken(authHeader.substring(7));
            ApplicationDto application = applicationService.getApplicationById(id, email);
            return ResponseEntity.ok(application);
        } catch (Exception e) {
            log.error("Error fetching application: ", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}