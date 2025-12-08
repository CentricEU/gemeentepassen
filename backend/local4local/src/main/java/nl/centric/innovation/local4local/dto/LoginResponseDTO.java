package nl.centric.innovation.local4local.dto;

import lombok.Builder;

import javax.validation.constraints.NotNull;

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