package com.nithish9020.backend.repository;

import com.nithish9020.backend.entity.Interview;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
public interface InterviewRepository extends MongoRepository<Interview, String> {
    List<Interview> findByCreatedBy(String createdBy);
}