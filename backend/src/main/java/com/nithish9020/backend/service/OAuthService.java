package com.nithish9020.backend.service;

import com.nithish9020.backend.dto.OAuthRequest;
import com.nithish9020.backend.dto.OAuthUserInfo;
import com.nithish9020.backend.entity.User;
import com.nithish9020.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class OAuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${google.oauth.client-id}")
    private String googleClientId;

    @Value("${google.oauth.client-secret}")
    private String googleClientSecret;

    @Value("${google.oauth.redirect-uri}")
    private String googleRedirectUri;

    @Value("${microsoft.oauth.client-id}")
    private String microsoftClientId;

    @Value("${microsoft.oauth.client-secret}")
    private String microsoftClientSecret;

    @Value("${microsoft.oauth.redirect-uri}")
    private String microsoftRedirectUri;

    @Value("${microsoft.oauth.tenant-id}")
    private String microsoftTenantId;

    public Map<String, Object> handleOAuthCallback(OAuthRequest request) {
        try {
            log.info("Handling OAuth callback for provider: {}, role: {}", request.getProvider(), request.getRole());
            log.info("Authorization code: {}",
                    request.getCode().substring(0, Math.min(10, request.getCode().length())) + "...");

            OAuthUserInfo userInfo = getUserInfoFromProvider(request);
            log.info("Successfully retrieved user info: {}", userInfo.getEmail());

            // Check if user already exists
            Optional<User> existingUser = userRepository.findByEmail(userInfo.getEmail());

            if (existingUser.isPresent()) {
                User user = existingUser.get();
                log.info("Existing user found: {}", user.getEmail());
                // Update OAuth info if needed
                if (!user.isOAuthUser()) {
                    user.setOauthId(userInfo.getId());
                    user.setOauthProvider(userInfo.getProvider());
                    user.setOAuthUser(true);
                    user.setEmailVerified(true);
                    userRepository.save(user);
                    log.info("Updated user with OAuth info");
                }

                String token = jwtService.generateToken(user.getEmail());
                return createAuthResponse("Login successful", token, user.getRole(), user.getName(), user.getEmail());
            } else {
                // Create new user
                log.info("Creating new OAuth user: {}", userInfo.getEmail());
                User newUser = createOAuthUser(userInfo, request.getRole());
                String token = jwtService.generateToken(newUser.getEmail());
                return createAuthResponse("Account created successfully", token, newUser.getRole(), newUser.getName(),
                        newUser.getEmail());
            }
        } catch (Exception e) {
            log.error("OAuth authentication failed: {}", e.getMessage(), e);
            throw new RuntimeException("OAuth authentication failed: " + e.getMessage());
        }
    }

    private OAuthUserInfo getUserInfoFromProvider(OAuthRequest request) {
        if ("google".equals(request.getProvider())) {
            return getGoogleUserInfo(request.getCode());
        } else if ("microsoft".equals(request.getProvider())) {
            return getMicrosoftUserInfo(request.getCode());
        } else {
            throw new IllegalArgumentException("Unsupported OAuth provider: " + request.getProvider());
        }
    }

    @SuppressWarnings("unchecked")
    private OAuthUserInfo getGoogleUserInfo(String code) {
        try {
            log.info("Starting Google OAuth token exchange for code: {}",
                    code.substring(0, Math.min(10, code.length())) + "...");

            // Exchange code for access token
            String tokenUrl = "https://oauth2.googleapis.com/token";

            // Build form data as URL-encoded string
            String formData = String.format(
                    "client_id=%s&client_secret=%s&code=%s&grant_type=authorization_code&redirect_uri=%s",
                    googleClientId,
                    googleClientSecret,
                    code,
                    googleRedirectUri);

            log.info("Token request - client_id: {}, redirect_uri: {}", googleClientId, googleRedirectUri);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            HttpEntity<String> tokenEntity = new HttpEntity<>(formData, headers);

            ResponseEntity<Map> tokenResponse = restTemplate.postForEntity(tokenUrl, tokenEntity, Map.class);
            log.info("Token response status: {}", tokenResponse.getStatusCode());

            if (tokenResponse.getBody() == null) {
                throw new RuntimeException("Token response body is null");
            }

            String accessToken = (String) tokenResponse.getBody().get("access_token");
            if (accessToken == null) {
                log.error("Access token is null. Token response: {}", tokenResponse.getBody());
                throw new RuntimeException("Access token is null in response");
            }

            log.info("Successfully obtained access token");

            // Get user info
            String userInfoUrl = "https://www.googleapis.com/oauth2/v2/userinfo?access_token=" + accessToken;
            ResponseEntity<Map> userInfoResponse = restTemplate.getForEntity(userInfoUrl, Map.class);
            log.info("User info response status: {}", userInfoResponse.getStatusCode());

            if (userInfoResponse.getBody() == null) {
                throw new RuntimeException("User info response body is null");
            }

            Map<String, Object> userInfo = userInfoResponse.getBody();
            log.info("User info received: {}", userInfo);

            return OAuthUserInfo.builder()
                    .id((String) userInfo.get("id"))
                    .email((String) userInfo.get("email"))
                    .name((String) userInfo.get("name"))
                    .provider("google")
                    .verified_email((Boolean) userInfo.get("verified_email"))
                    .build();

        } catch (Exception e) {
            log.error("Failed to get Google user info: {}", e.getMessage(), e);

            // Check if it's an invalid_grant error (code already used)
            if (e.getMessage().contains("invalid_grant")) {
                throw new RuntimeException(
                        "Authorization code has already been used or expired. Please try signing in again.");
            }

            throw new RuntimeException("Failed to get Google user info: " + e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    private OAuthUserInfo getMicrosoftUserInfo(String code) {
        try {
            // Exchange code for access token
            String tokenUrl = "https://login.microsoftonline.com/" + microsoftTenantId + "/oauth2/v2.0/token";

            // Build form data as URL-encoded string
            String formData = String.format(
                    "client_id=%s&client_secret=%s&code=%s&grant_type=authorization_code&redirect_uri=%s&scope=openid profile email",
                    microsoftClientId,
                    microsoftClientSecret,
                    code,
                    microsoftRedirectUri);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            HttpEntity<String> tokenEntity = new HttpEntity<>(formData, headers);

            ResponseEntity<Map> tokenResponse = restTemplate.postForEntity(tokenUrl, tokenEntity, Map.class);
            String accessToken = (String) tokenResponse.getBody().get("access_token");

            // Get user info
            String userInfoUrl = "https://graph.microsoft.com/v1.0/me";
            HttpHeaders userInfoHeaders = new HttpHeaders();
            userInfoHeaders.setBearerAuth(accessToken);
            HttpEntity<String> userInfoEntity = new HttpEntity<>(userInfoHeaders);

            ResponseEntity<Map> userInfoResponse = restTemplate.exchange(userInfoUrl, HttpMethod.GET, userInfoEntity,
                    Map.class);
            Map<String, Object> userInfo = userInfoResponse.getBody();

            return OAuthUserInfo.builder()
                    .id((String) userInfo.get("id"))
                    .email((String) userInfo.get("mail"))
                    .name((String) userInfo.get("displayName"))
                    .provider("microsoft")
                    .verified_email(true) // Microsoft users are considered verified
                    .build();

        } catch (Exception e) {
            log.error("Failed to get Microsoft user info: {}", e.getMessage());
            throw new RuntimeException("Failed to get Microsoft user info");
        }
    }

    private User createOAuthUser(OAuthUserInfo userInfo, String role) {
        User user = User.builder()
                .email(userInfo.getEmail().toLowerCase())
                .name(userInfo.getName())
                .passwordHash("OAUTH_USER_NO_PASSWORD") // Placeholder for OAuth users
                .emailVerified(userInfo.isVerified_email())
                .role(com.nithish9020.backend.dto.SignupRequest.ROLE.valueOf(role))
                .oauthId(userInfo.getId())
                .oauthProvider(userInfo.getProvider())
                .isOAuthUser(true)
                .createdAt(java.time.Instant.now())
                .build();

        return userRepository.save(user);
    }

    private Map<String, Object> createAuthResponse(String message, String token,
            com.nithish9020.backend.dto.SignupRequest.ROLE role, String name, String email) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", message);
        response.put("token", token);
        response.put("role", role);
        response.put("name", name);
        response.put("email", email);
        return response;
    }
}