package nl.centric.innovation.local4local.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import lombok.Builder;


@Builder
public record CreateUserDto(

        @NotEmpty(message = "First name is required")
        String firstName,

        @NotEmpty(message = "Last name is required")
        String lastName,

        @NotEmpty(message = "Email is required")
        @Email(message = "Invalid email format")
        String email,

        boolean isSuperAdmin
) { }
