package nl.centric.innovation.local4local.dto;

import lombok.Builder;

@Builder
public record TokenRefreshResponseDto(String accessToken, String refreshToken) {
}

