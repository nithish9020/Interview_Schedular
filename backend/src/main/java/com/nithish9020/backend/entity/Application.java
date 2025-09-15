package com.nithish9020.backend.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "applications")
public class Application {
    @Id
    private String id;
    private String applicantEmail;
    private String interviewId;
    private String interviewDate;
    private String timeSlot;
    private String status;
    private LocalDateTime createdAt;
}