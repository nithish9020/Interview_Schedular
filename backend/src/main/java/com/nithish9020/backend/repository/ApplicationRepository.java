package com.nithish9020.backend.repository;

import com.nithish9020.backend.entity.Application;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ApplicationRepository extends MongoRepository<Application, String> {
    List<Application> findByApplicantEmailOrderByCreatedAtDesc(String email);
}