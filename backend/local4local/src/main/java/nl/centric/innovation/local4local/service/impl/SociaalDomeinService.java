package nl.centric.innovation.local4local.service.impl;

import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.SociaalDomeinResponse;
import nl.centric.innovation.local4local.dto.SociaalDomeinToken;
import nl.centric.innovation.local4local.exceptions.SocialDomeinException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import org.springframework.http.MediaType;
import org.springframework.http.HttpHeaders;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Collections;

/**
 * Retrieves a valid SocialDomein access token synchronously.
 */
@Service
@RequiredArgsConstructor
public class SociaalDomeinService {

    private final RestTemplate restTemplate;

    private SociaalDomeinToken token;

    @Value("${sociaal-domein.url}")
    private String authenticationUrl;

    @Value("${sociaal-domein.client-id}")
    private String clientId;

    @Value("${sociaal-domein.client-secret}")
    private String clientSecret;

    @Value("${error.sociaal-domein}")
    private String socialDomeinError;

    private static final String GRANT_TYPE_CLIENT_CREDENTIALS = "client_credentials";

    /**
     * Returns a valid token. If the cached token is valid, it returns it.
     * Otherwise, fetches a new token.
     */
    public String getToken() {
        if (token != null && token.isValid()) {
            return token.accessToken();
        }

        token = fetchNewToken();
        return token.accessToken();
    }

    /**
     * Fetches a new token from the SocialDomein authentication endpoint.
     * Throws SocialDomeinException on failure.
     */
    private SociaalDomeinToken fetchNewToken() {
        HttpEntity<MultiValueMap<String, String>> request = createAuthRequest();

        ResponseEntity<SociaalDomeinResponse> response;

        try {
            response = restTemplate.postForEntity(authenticationUrl, request, SociaalDomeinResponse.class);
        } catch (HttpClientErrorException e) {
            throw new SocialDomeinException(socialDomeinError); // Invalid credentials or other client error
        }

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new SocialDomeinException(socialDomeinError); // Unexpected response
        }

        return mapToToken(response.getBody());
    }

    /**
     * Creates the HTTP request entity for the token request.
     */
    private HttpEntity<MultiValueMap<String, String>> createAuthRequest() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", GRANT_TYPE_CLIENT_CREDENTIALS);
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);

        return new HttpEntity<>(body, headers);
    }

    /**
     * Maps the SocialDomeinResponse to a SocialDomeinToken, calculating the expiration time.
     */
    private SociaalDomeinToken mapToToken(SociaalDomeinResponse response) {
        LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(response.expiresIn());
        return new SociaalDomeinToken(response.accessToken(), expiresAt);
    }
}
