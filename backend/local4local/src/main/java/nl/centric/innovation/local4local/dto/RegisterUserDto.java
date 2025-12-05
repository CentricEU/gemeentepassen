package nl.centric.innovation.local4local.dto;

import lombok.Builder;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotEmpty;
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
