package com.nithish9020.backend.Repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.nithish9020.backend.modal.User;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
}
