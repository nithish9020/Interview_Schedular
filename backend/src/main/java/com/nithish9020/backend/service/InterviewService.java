package com.nithish9020.backend.service;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import com.nithish9020.backend.dto.CreateInterviewRequest;
import com.nithish9020.backend.dto.CandidateDto;
import com.nithish9020.backend.entity.Interview;
import com.nithish9020.backend.entity.ApplicantInterview;
import com.nithish9020.backend.repository.InterviewRepository;
import com.nithish9020.backend.repository.ApplicantInterviewRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class InterviewService {
    private final InterviewRepository interviewRepository;
    private final ApplicantInterviewRepository applicantInterviewRepository;

    public List<CandidateDto> processExcelFile(MultipartFile file) throws IOException {
        List<CandidateDto> candidates = new ArrayList<>();
        log.info("Starting to process Excel file: {}", file.getOriginalFilename());

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            int totalRows = sheet.getPhysicalNumberOfRows();
            log.info("Total rows in sheet: {}", totalRows);

            // Skip header row
            for (int i = 1; i < totalRows; i++) {
                Row row = sheet.getRow(i);
                if (row == null)
                    continue;

                try {
                    Cell emailCell = row.getCell(0);
                    Cell nameCell = row.getCell(1);

                    // Add debug logging
                    log.debug("Processing row {}: Email={}, Name={}",
                            i,
                            emailCell != null ? emailCell.getStringCellValue() : "null",
                            nameCell != null ? nameCell.getStringCellValue() : "null");

                    if (emailCell != null && nameCell != null
                            && emailCell.getCellType() == CellType.STRING
                            && nameCell.getCellType() == CellType.STRING) {

                        String email = emailCell.getStringCellValue().trim();
                        String name = nameCell.getStringCellValue().trim();

                        if (!email.isEmpty() && !name.isEmpty()) {
                            CandidateDto candidate = new CandidateDto();
                            candidate.setEmail(email);
                            candidate.setName(name);
                            candidates.add(candidate);
                            log.info("Added candidate: email={}, name={}", email, name);
                        }
                    }
                } catch (Exception e) {
                    log.error("Error processing row {}: {}", i, e.getMessage());
                }
            }
        }

        log.info("Processed {} candidates from Excel file", candidates.size());
        if (candidates.isEmpty()) {
            throw new IllegalArgumentException("No valid candidates found in Excel file. Please check the format.");
        }

        return candidates;
    }

    @Transactional
    public String createInterview(CreateInterviewRequest request, String createdBy) {
        Interview interview = new Interview();
        interview.setInterviewName(request.getInterviewName());
        interview.setFromDate(request.getFromDate());
        interview.setToDate(request.getToDate());

        // Create timeSlots map with null values for each slot
        Map<String, Map<String, String>> timeSlots = new HashMap<>();

        // Ensure timeSlots is not null in the request
        if (request.getTimeSlots() != null) {
            // Iterate over the map entries instead of the map itself
            request.getTimeSlots().forEach((date, slots) -> {
                Map<String, String> dailySlots = new HashMap<>();
                slots.forEach((time, applicant) -> {
                    dailySlots.put(time, null); // Initialize all slots as null
                });
                timeSlots.put(date, dailySlots);
            });
        }

        interview.setTimeSlots(timeSlots);
        interview.setCreatedBy(createdBy);
        interview.setCreatedAt(LocalDateTime.now());

        Interview savedInterview = interviewRepository.save(interview);

        // Process each candidate
        if (request.getCandidates() != null && !request.getCandidates().isEmpty()) {
            request.getCandidates().forEach(candidate -> processApplicant(candidate, savedInterview.getId()));
        }

        return savedInterview.getId();
    }

    private void processApplicant(CandidateDto candidate, String interviewId) {
        try {
            // Try to find existing applicant
            applicantInterviewRepository.findByEmail(candidate.getEmail())
                    .ifPresentOrElse(
                            // Update existing applicant
                            existingApplicant -> {
                                if (existingApplicant.getInterviewIds() == null) {
                                    existingApplicant.setInterviewIds(new ArrayList<>());
                                }
                                if (!existingApplicant.getInterviewIds().contains(interviewId)) {
                                    existingApplicant.getInterviewIds().add(interviewId);
                                    existingApplicant.setUpdatedAt(LocalDateTime.now());
                                    applicantInterviewRepository.save(existingApplicant);
                                    log.info("Updated existing applicant: {}", candidate.getEmail());
                                }
                            },
                            // Create new applicant
                            () -> {
                                ApplicantInterview newApplicant = new ApplicantInterview();
                                newApplicant.setEmail(candidate.getEmail());
                                newApplicant.setName(candidate.getName());
                                newApplicant.setInterviewIds(new ArrayList<>(Collections.singletonList(interviewId)));
                                newApplicant.setUpdatedAt(LocalDateTime.now());
                                applicantInterviewRepository.save(newApplicant);
                                log.info("Created new applicant: {}", candidate.getEmail());
                            });
        } catch (Exception e) {
            log.error("Error processing applicant {}: {}", candidate.getEmail(), e.getMessage());
            throw new RuntimeException("Failed to process applicant: " + candidate.getEmail(), e);
        }
    }
}