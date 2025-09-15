package com.nithish9020.backend.repository;

import com.nithish9020.backend.entity.Interview;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface InterviewRepository extends MongoRepository<Interview, String> {
}