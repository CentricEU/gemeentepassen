package nl.centric.innovation.local4local.dto;

import java.time.LocalDateTime;

public record SociaalDomeinToken(
        String accessToken,
        LocalDateTime expiresAt
) {

    public boolean isValid() {
        if (accessToken == null) return false;

        return expiresAt.isAfter(LocalDateTime.now().plusSeconds(5));
    }
}
