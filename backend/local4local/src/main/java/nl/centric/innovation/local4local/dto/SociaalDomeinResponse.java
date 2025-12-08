package nl.centric.innovation.local4local.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record SociaalDomeinResponse(
        @JsonProperty("access_token") String accessToken,
        @JsonProperty("expires_in") int expiresIn
) {}
