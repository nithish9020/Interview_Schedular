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
            log.info("OAuth user info - ID: {}, Provider: {}, Name: {}", userInfo.getId(), userInfo.getProvider(),
                    userInfo.getName());

            // Check if user already exists by OAuth ID and provider first (most reliable)
            log.info("Looking for existing user with OAuth ID: {} and provider: {}", userInfo.getId(),
                    userInfo.getProvider());
            Optional<User> existingUser = userRepository.findByOauthIdAndOauthProvider(userInfo.getId(),
                    userInfo.getProvider());

            if (existingUser.isPresent()) {
                log.info("Found existing user by OAuth ID: {}", existingUser.get().getEmail());
            } else {
                log.info("No user found by OAuth ID, trying by email: {}", userInfo.getEmail());
                // If not found by OAuth ID, try by email
                existingUser = userRepository.findByEmail(userInfo.getEmail());
                if (existingUser.isPresent()) {
                    log.info("Found existing user by email: {}", existingUser.get().getEmail());
                }
            }

            if (existingUser.isEmpty()) {
                // If still not found, try to find by email with external format
                // This handles cases where the email was stored in external format
                String externalEmail = userInfo.getEmail().replace("@", "_")
                        + "#EXT#@nithishkumar9020outlook.onmicrosoft.com";
                existingUser = userRepository.findByEmail(externalEmail);
                if (existingUser.isPresent()) {
                    log.info("Found existing user with external email format: {}", externalEmail);
                }
            }

            if (existingUser.isPresent()) {
                User user = existingUser.get();
                log.info("Existing user found: {}", user.getEmail());

                // Always update OAuth info to ensure it's current
                user.setOauthId(userInfo.getId());
                user.setOauthProvider(userInfo.getProvider());
                user.setOAuthUser(true);
                user.setEmailVerified(true);

                // Check if the existing user has an external email format that needs cleaning
                if (user.getEmail().contains("#EXT#") || user.getEmail().contains("#ext#")) {
                    log.info("Cleaning up external email format for existing user");
                    String[] parts = user.getEmail().split("#EXT#|#ext#");
                    String cleanedEmail = parts[0].toLowerCase();
                    user.setEmail(cleanedEmail);
                    log.info("Updated user email to: {}", cleanedEmail);
                }

                // Update user name if it's different
                if (userInfo.getName() != null && !userInfo.getName().equals(user.getName())) {
                    user.setName(userInfo.getName());
                    log.info("Updated user name to: {}", userInfo.getName());
                }

                userRepository.save(user);
                log.info("Updated existing user with OAuth info and cleaned email");

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
            log.info("Starting Microsoft OAuth token exchange for code: {}",
                    code.substring(0, Math.min(10, code.length())) + "...");

            // Exchange code for access token
            String tokenUrl = "https://login.microsoftonline.com/" + microsoftTenantId + "/oauth2/v2.0/token";

            // Build form data as URL-encoded string
            String formData = String.format(
                    "client_id=%s&client_secret=%s&code=%s&grant_type=authorization_code&redirect_uri=%s&scope=openid profile email User.Read",
                    microsoftClientId,
                    microsoftClientSecret,
                    code,
                    microsoftRedirectUri);

            log.info("Microsoft token request - client_id: {}, redirect_uri: {}, tenant_id: {}",
                    microsoftClientId, microsoftRedirectUri, microsoftTenantId);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            HttpEntity<String> tokenEntity = new HttpEntity<>(formData, headers);

            ResponseEntity<Map> tokenResponse = restTemplate.postForEntity(tokenUrl, tokenEntity, Map.class);
            log.info("Microsoft token response status: {}", tokenResponse.getStatusCode());

            if (tokenResponse.getBody() == null) {
                throw new RuntimeException("Microsoft token response body is null");
            }

            String accessToken = (String) tokenResponse.getBody().get("access_token");
            if (accessToken == null) {
                log.error("Microsoft access token is null. Token response: {}", tokenResponse.getBody());
                throw new RuntimeException("Microsoft access token is null in response");
            }

            log.info("Successfully obtained Microsoft access token");

            // Get user info with specific fields
            String userInfoUrl = "https://graph.microsoft.com/v1.0/me?$select=id,displayName,mail,userPrincipalName,email";
            HttpHeaders userInfoHeaders = new HttpHeaders();
            userInfoHeaders.setBearerAuth(accessToken);
            HttpEntity<String> userInfoEntity = new HttpEntity<>(userInfoHeaders);

            ResponseEntity<Map> userInfoResponse = restTemplate.exchange(userInfoUrl, HttpMethod.GET, userInfoEntity,
                    Map.class);
            log.info("Microsoft user info response status: {}", userInfoResponse.getStatusCode());
            log.info("Microsoft user info response headers: {}", userInfoResponse.getHeaders());

            if (userInfoResponse.getBody() == null) {
                throw new RuntimeException("Microsoft user info response body is null");
            }

            Map<String, Object> userInfo = userInfoResponse.getBody();
            log.info("Microsoft user info received: {}", userInfo);
            log.info("Microsoft user info fields - mail: {}, userPrincipalName: {}, email: {}",
                    userInfo.get("mail"), userInfo.get("userPrincipalName"), userInfo.get("email"));

            // Debug: Print all available fields
            log.info("All Microsoft user info fields: {}", userInfo.keySet());
            for (Map.Entry<String, Object> entry : userInfo.entrySet()) {
                log.info("Field '{}': {}", entry.getKey(), entry.getValue());
            }

            // Microsoft Graph API might return email in different fields
            String email = (String) userInfo.get("mail");
            log.info("Initial email from 'mail' field: {}", email);

            if (email == null) {
                email = (String) userInfo.get("email");
                log.info("Email from 'email' field: {}", email);
            }

            if (email == null) {
                String userPrincipalName = (String) userInfo.get("userPrincipalName");
                log.info("UserPrincipalName: {}", userPrincipalName);

                if (userPrincipalName != null) {
                    // Handle external user format: user@domain.com#EXT#@tenant.onmicrosoft.com
                    // (note: EXT is uppercase)
                    if (userPrincipalName.contains("#EXT#") || userPrincipalName.contains("#ext#")) {
                        // Extract the actual email before #EXT# or #ext#
                        String[] parts = userPrincipalName.split("#EXT#|#ext#");
                        email = parts[0];

                        // Fix the email format - replace _ with @ if needed
                        if (email.contains("_") && !email.contains("@")) {
                            // This is likely in format: user_domain.com, need to convert to user@domain.com
                            email = email.replaceFirst("_", "@");
                        }

                        log.info("Extracted email from userPrincipalName: {}", email);
                    } else {
                        email = userPrincipalName;
                        log.info("Using userPrincipalName as email: {}", email);
                    }
                }
            }

            if (email == null) {
                // Try other possible email fields
                email = (String) userInfo.get("otherMails");
                if (email == null) {
                    email = (String) userInfo.get("proxyAddresses");
                }
                if (email == null) {
                    // Try to extract from any field that might contain an email
                    for (Map.Entry<String, Object> entry : userInfo.entrySet()) {
                        String value = String.valueOf(entry.getValue());
                        if (value.contains("@") && !value.contains("#ext#")) {
                            email = value;
                            log.info("Found email in field '{}': {}", entry.getKey(), email);
                            break;
                        }
                    }
                }
            }

            if (email == null) {
                // Last resort: try to create a clean email from userPrincipalName
                String userPrincipalName = (String) userInfo.get("userPrincipalName");
                if (userPrincipalName != null) {
                    if (userPrincipalName.contains("#EXT#") || userPrincipalName.contains("#ext#")) {
                        email = userPrincipalName.split("#EXT#|#ext#")[0];

                        // Fix the email format - replace _ with @ if needed
                        if (email.contains("_") && !email.contains("@")) {
                            email = email.replaceFirst("_", "@");
                        }

                        log.info("Last resort: extracted email from userPrincipalName: {}", email);
                    } else {
                        email = userPrincipalName;
                        log.info("Last resort: using userPrincipalName as email: {}", email);
                    }
                }
            }

            if (email == null) {
                log.error("No email found in Microsoft user info. Available fields: {}", userInfo.keySet());
                throw new RuntimeException("No email found in Microsoft user info");
            }

            // Clean up the email - remove any remaining #EXT# or #ext# artifacts
            if (email.contains("#EXT#") || email.contains("#ext#")) {
                String[] parts = email.split("#EXT#|#ext#");
                email = parts[0];
                log.info("Cleaned email after removing #EXT#/#ext#: {}", email);
            }

            log.info("Final extracted email: {}", email);

            return OAuthUserInfo.builder()
                    .id((String) userInfo.get("id"))
                    .email(email)
                    .name((String) userInfo.get("displayName"))
                    .provider("microsoft")
                    .verified_email(true) // Microsoft users are considered verified
                    .build();

        } catch (Exception e) {
            log.error("Failed to get Microsoft user info: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get Microsoft user info: " + e.getMessage());
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