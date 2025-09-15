package com.nithish9020.backend.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@Document(collection = "interviews")
public class Interview {
    @Id
    private String id;
    private String interviewName;
    private LocalDate fromDate;
    private LocalDate toDate;
    private Map<String, Map<String, String>> timeSlots; // date -> {time -> applicantEmail}
    private String createdBy;
    private LocalDateTime createdAt;
}