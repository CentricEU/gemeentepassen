package nl.centric.innovation.local4local.dto;

import lombok.Builder;
import org.springframework.http.HttpHeaders;

@Builder
public record AuthResponseDto(LoginResponseDTO loginResponseDTO, HttpHeaders httpHeaders) {
}
