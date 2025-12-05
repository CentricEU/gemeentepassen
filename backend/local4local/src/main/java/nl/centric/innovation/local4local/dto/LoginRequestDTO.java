package nl.centric.innovation.local4local.dto;

import lombok.Builder;

@Builder
public record LoginRequestDTO(String username, String password, String role, String reCaptchaResponse, Boolean rememberMe) {

}