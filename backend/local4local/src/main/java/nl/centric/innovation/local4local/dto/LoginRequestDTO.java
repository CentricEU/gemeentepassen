package nl.centric.innovation.local4local.dto;

import lombok.Builder;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotNull;

@Builder
public record LoginRequestDTO(@NotNull(message = "Email is required")
                              @Email(message = "Invalid email format") String username,

                              @NotNull(message = "Password is required")
                              String password,

                              @NotNull(message = "Role is required")
                              String role,

                              String reCaptchaResponse,

                              Boolean rememberMe) {

}