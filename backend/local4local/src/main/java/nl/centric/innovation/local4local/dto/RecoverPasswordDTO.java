package nl.centric.innovation.local4local.dto;

import lombok.Builder;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotNull;

@Builder
public record RecoverPasswordDTO(@NotNull(message = "Email is required")
                                 @Email(message = "Invalid email format")
                                 String email,
                                 @NotNull(message = "reCAPTCHA is required")
                                 String reCaptchaResponse,
                                 @NotNull(message = "Role is required")
                                 String role) {

}