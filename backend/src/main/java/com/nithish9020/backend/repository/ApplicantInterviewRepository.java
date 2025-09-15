package com.nithish9020.backend.repository;

import com.nithish9020.backend.entity.ApplicantInterview;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicantInterviewRepository extends MongoRepository<ApplicantInterview, String> {
    Optional<ApplicantInterview> findByEmail(String email);

    @Query("{ 'interviewIds': ?0 }")
    List<ApplicantInterview> findByInterviewIds(String interviewId);
}