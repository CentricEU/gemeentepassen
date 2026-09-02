package nl.centric.innovation.local4local.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;


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