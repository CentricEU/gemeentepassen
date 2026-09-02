package nl.centric.innovation.local4local.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;


@Builder
public record LoginResponseDto(
        @NotNull(message = "Token is required")
        String token,
        String refreshToken) {

    public static LoginResponseDto of(String token, String refreshToken) {
        return LoginResponseDto.builder()
                .token(token)
                .refreshToken(refreshToken)
                .build();
    }
}