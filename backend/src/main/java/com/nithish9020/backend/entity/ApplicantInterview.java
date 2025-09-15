package com.nithish9020.backend.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "applicants_interview")
public class ApplicantInterview {
    @Id
    private String email;

    private String name;
    private List<String> interviewIds;
    private LocalDateTime updatedAt;
}
