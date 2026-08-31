package nl.centric.innovation.local4local.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;


@Builder
public record RecoverPasswordDTO(@NotNull(message = "Email is required")
                                 @Email(message = "Invalid email format")
                                 String email,
                                 @NotNull(message = "reCAPTCHA is required")
                                 String reCaptchaResponse,
                                 @NotNull(message = "Role is required")
                                 String role) {

}