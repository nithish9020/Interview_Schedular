package com.nithish9020.backend.service;

import com.nithish9020.backend.dto.ApplicationDto;
import com.nithish9020.backend.entity.ApplicantInterview;
import com.nithish9020.backend.entity.Interview;
import com.nithish9020.backend.repository.ApplicantInterviewRepository;
import com.nithish9020.backend.repository.InterviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApplicationService {
    private final ApplicantInterviewRepository applicantInterviewRepository;
    private final InterviewRepository interviewRepository;

    public List<ApplicationDto> getMyApplications(String email) {
        log.info("Fetching available interviews for email: {}", email);

        // Get all interviews with available slots
        List<Interview> availableInterviews = interviewRepository.findAll();
        List<ApplicationDto> applications = new ArrayList<>();

        for (Interview interview : availableInterviews) {
            try {
                // Check if any slots are available (not null)
                Map<String, Map<String, String>> timeSlots = interview.getTimeSlots();
                boolean hasAvailableSlots = false;

                for (Map<String, String> daySlots : timeSlots.values()) {
                    if (daySlots.containsValue(null)) {
                        hasAvailableSlots = true;
                        break;
                    }
                }

                if (hasAvailableSlots) {
                    ApplicationDto dto = new ApplicationDto();
                    dto.setId(interview.getId());
                    dto.setInterviewName(interview.getInterviewName());
                    dto.setInterviewer(interview.getCreatedBy());
                    dto.setStatus("available");

                    // Get the date range
                    List<String> dates = new ArrayList<>(timeSlots.keySet());
                    Collections.sort(dates);
                    if (!dates.isEmpty()) {
                        dto.setInterviewDate(dates.get(0) + " to " + dates.get(dates.size() - 1));
                    }

                    // Count available slots
                    int availableSlotCount = timeSlots.values().stream()
                            .mapToInt(slots -> (int) slots.values().stream().filter(Objects::isNull).count())
                            .sum();
                    dto.setTimeSlot(availableSlotCount + " slots available");

                    applications.add(dto);
                    log.info("Added available interview: {} with {} slots",
                            interview.getInterviewName(), availableSlotCount);
                }
            } catch (Exception e) {
                log.error("Error processing interview {}: {}", interview.getId(), e.getMessage());
            }
        }

        log.info("Found {} available interviews", applications.size());
        return applications;
    }

    public Map<String, Integer> getApplicationStats(List<ApplicationDto> applications) {
        return Map.of(
                "total", applications.size(),
                "available", applications.size(),
                "booked", 0,
                "completed", 0);
    }

    // Add method to book a slot
    public void bookSlot(String interviewId, String date, String timeSlot, String email) {
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

        // Add to applicant's interviews
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
    }

    public ApplicationDto getApplicationById(String id, String email) {
        log.info("Fetching application details for id: {} and email: {}", id, email);

        try {
            // Find the interview
            Interview interview = interviewRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Interview not found with id: " + id));
            log.info("Found interview: {}", interview.getInterviewName());

            // Find the applicant
            ApplicantInterview applicant = applicantInterviewRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("No applications found for email: " + email));
            log.info("Found applicant with {} interviews", applicant.getInterviewIds().size());

            // Check authorization
            if (!applicant.getInterviewIds().contains(id)) {
                log.warn("Unauthorized access attempt for interview {} by {}", id, email);
                throw new RuntimeException("You are not authorized to view this interview details");
            }

            // Find booking details
            String[] bookingDetails = findBookingDetails(interview, email);
            if (bookingDetails == null) {
                log.warn("No booking found for email {} in interview {}", email, id);

                // Instead of throwing error, return available slot details
                ApplicationDto dto = new ApplicationDto();
                dto.setId(id);
                dto.setInterviewName(interview.getInterviewName());
                dto.setInterviewer(interview.getCreatedBy());
                dto.setStatus("pending");

                // Get the first available date and slot
                Map.Entry<String, Map<String, String>> firstDate = interview.getTimeSlots().entrySet().stream()
                        .findFirst().orElse(null);
                if (firstDate != null) {
                    dto.setInterviewDate(firstDate.getKey());
                    dto.setTimeSlot("Not booked yet");
                }

                return dto;
            }

            // Create DTO with booking details
            ApplicationDto dto = new ApplicationDto();
            dto.setId(id);
            dto.setInterviewName(interview.getInterviewName());
            dto.setInterviewDate(bookingDetails[0]);
            dto.setTimeSlot(bookingDetails[1]);
            dto.setStatus(determineStatus(bookingDetails[0]));
            dto.setInterviewer(interview.getCreatedBy());

            log.info("Successfully fetched application details for interview: {}", interview.getInterviewName());
            return dto;

        } catch (Exception e) {
            log.error("Error fetching application details: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch application details: " + e.getMessage());
        }
    }

    private String[] findBookingDetails(Interview interview, String email) {
        // Implement logic to find booking details for the applicant
        // This is a placeholder implementation
        for (Map.Entry<String, Map<String, String>> dateEntry : interview.getTimeSlots().entrySet()) {
            String date = dateEntry.getKey();
            Map<String, String> slots = dateEntry.getValue();
            for (Map.Entry<String, String> slotEntry : slots.entrySet()) {
                String timeSlot = slotEntry.getKey();
                String bookedEmail = slotEntry.getValue();
                if (email.equals(bookedEmail)) {
                    return new String[] { date, timeSlot };
                }
            }
        }
        return null;
    }

    private String determineStatus(String date) {
        try {
            Date interviewDate = new java.text.SimpleDateFormat("yyyy-MM-dd").parse(date);
            Date today = new Date();

            if (interviewDate.after(today)) {
                return "upcoming";
            } else if (interviewDate.before(today)) {
                return "completed";
            } else {
                return "today";
            }
        } catch (Exception e) {
            log.error("Error determining status: {}", e.getMessage());
            return "unknown";
        }
    }
}