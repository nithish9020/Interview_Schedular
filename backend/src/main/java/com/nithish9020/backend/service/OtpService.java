// src/main/java/com/nithish9020/backend/service/OtpService.java
package com.nithish9020.backend.service;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;

@Service
public class OtpService {

    private final StringRedisTemplate redis;
    private static final SecureRandom RNG = new SecureRandom();
    private static final Duration OTP_TTL = Duration.ofMinutes(10); // 10 min expiry

    public OtpService(StringRedisTemplate redis) {
        this.redis = redis;
    }

    // Generate 6-digit OTP, store in Redis with TTL
    public String generateOtp(String email) {
        int code = RNG.nextInt(1_000_000);
        String otp = String.format("%06d", code);
        String key = redisKey(email);
        redis.opsForValue().set(key, otp, OTP_TTL);
        return otp;
    }

    // Verify OTP: check stored value, then delete on success
    public boolean verifyOtp(String email, String code) {
        String key = redisKey(email);
        String stored = redis.opsForValue().get(key);
        if (stored == null) return false;
        boolean ok = stored.equals(code);
        if (ok) {
            redis.delete(key); // one-time use
        }
        return ok;
    }

    private String redisKey(String email) {
        return "otp:" + email.toLowerCase();
    }
}
