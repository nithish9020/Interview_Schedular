package com.nithish9020.backend.Service;

import org.springframework.stereotype.Service;
import com.nithish9020.backend.Repository.UserRepository;
import com.nithish9020.backend.modal.User;

import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
