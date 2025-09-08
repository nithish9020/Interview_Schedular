package com.nithish9020.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nithish9020.backend.dto.SignupRequest.ROLE;
import com.nithish9020.backend.dto.TempUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class RedisService {
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final long TEMP_USER_TTL_MINUTES = 10;

    public void saveTempUser(String email, String name, String passwordHash, ROLE role) {
        try {
            TempUser tempUser = new TempUser(name, email, passwordHash, role);
            String json = objectMapper.writeValueAsString(tempUser);
            redisTemplate.opsForValue().set("tempuser:" + email, json, TEMP_USER_TTL_MINUTES, TimeUnit.MINUTES);
        } catch (Exception e) {
            throw new RuntimeException("Failed to save temp user to Redis", e);
        }
    }

    public TempUser getTempUser(String email) {
        try {
            String json = redisTemplate.opsForValue().get("tempuser:" + email);
            if (json == null)
                return null;
            return objectMapper.readValue(json, TempUser.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to get temp user from Redis", e);
        }
    }

    public void deleteTempUser(String email) {
        redisTemplate.delete("tempuser:" + email);
    }
}