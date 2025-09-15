package com.nithish9020.backend.service;

import com.nithish9020.backend.dto.CandidateDto;
import com.nithish9020.backend.dto.CreateInterviewRequest;
import com.nithish9020.backend.dto.InterviewDto;
import com.nithish9020.backend.entity.ApplicantInterview;
import com.nithish9020.backend.entity.Interview;
import com.nithish9020.backend.repository.ApplicantInterviewRepository;
import com.nithish9020.backend.repository.InterviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InterviewService {
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

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

    public List<Interview> getInterviewsByCreator(String createdBy) {
        return interviewRepository.findByCreatedBy(createdBy);
    }

    public void deleteInterview(String id, String createdBy) {
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interview not found"));

        if (!interview.getCreatedBy().equals(createdBy)) {
            throw new RuntimeException("Unauthorized to delete this interview");
        }

        interviewRepository.deleteById(id);
    }

    public Interview getInterviewById(String id, String username) {
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interview not found"));

        // Verify that the user has access to this interview
        if (!interview.getCreatedBy().equals(username)) {
            throw new RuntimeException("Unauthorized to view this interview");
        }

        return interview;
    }

    public List<InterviewDto> getAvailableInterviews(String email) {
        log.info("Finding available interviews for email: {}", email);
        List<Interview> allInterviews = interviewRepository.findAll();

        return allInterviews.stream()
                .filter(this::hasAvailableSlots)
                .map(interview -> {
                    InterviewDto dto = new InterviewDto();
                    dto.setId(interview.getId());
                    dto.setInterviewName(interview.getInterviewName());
                    dto.setFromDate(interview.getFromDate().format(DATE_FORMATTER));
                    dto.setToDate(interview.getToDate().format(DATE_FORMATTER));
                    dto.setAvailableSlots(getAvailableSlots(interview));
                    dto.setCreatedBy(interview.getCreatedBy());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private boolean hasAvailableSlots(Interview interview) {
        return interview.getTimeSlots().values().stream()
                .anyMatch(slots -> slots.containsValue(null));
    }

    private Map<String, List<String>> getAvailableSlots(Interview interview) {
        Map<String, List<String>> availableSlots = new HashMap<>();
        interview.getTimeSlots().forEach((date, slots) -> {
            List<String> freeSlots = slots.entrySet().stream()
                    .filter(entry -> entry.getValue() == null)
                    .map(Map.Entry::getKey)
                    .sorted()
                    .collect(Collectors.toList());
            if (!freeSlots.isEmpty()) {
                availableSlots.put(date, freeSlots);
            }
        });
        return availableSlots;
    }

    @Transactional
    public void bookSlot(String interviewId, String date, String timeSlot, String email) {
        log.info("Booking slot for interview: {} on date: {} at time: {} for user: {}",
                interviewId, date, timeSlot, email);

        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Interview not found"));

        Map<String, String> daySlots = interview.getTimeSlots().get(date);
        if (daySlots == null || !daySlots.containsKey(timeSlot)) {
            throw new RuntimeException("Invalid time slot");
        }

        if (daySlots.get(timeSlot) != null) {
            throw new RuntimeException("Slot already booked");
        }

        daySlots.put(timeSlot, email);
        interviewRepository.save(interview);

        // Update applicant's interviews
        applicantInterviewRepository.findByEmail(email)
                .ifPresentOrElse(
                        applicant -> {
                            if (!applicant.getInterviewIds().contains(interviewId)) {
                                applicant.getInterviewIds().add(interviewId);
                                applicantInterviewRepository.save(applicant);
                            }
                        },
                        () -> {
                            ApplicantInterview newApplicant = new ApplicantInterview();
                            newApplicant.setEmail(email);
                            newApplicant.setInterviewIds(new ArrayList<>(List.of(interviewId)));
                            applicantInterviewRepository.save(newApplicant);
                        });

        log.info("Successfully booked slot for interview: {}", interviewId);
    }
}