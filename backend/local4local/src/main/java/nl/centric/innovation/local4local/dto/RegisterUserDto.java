package nl.centric.innovation.local4local.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import lombok.Builder;

import java.util.UUID;

@Builder
public record RegisterUserDto(String firstName,
                              String lastName,
                              @NotEmpty(message = "Email is required")
                              @Email(message = "Invalid email format")
                              String email,
                              String password,
                              String retypedPassword,
                              UUID tenantId) {
}
