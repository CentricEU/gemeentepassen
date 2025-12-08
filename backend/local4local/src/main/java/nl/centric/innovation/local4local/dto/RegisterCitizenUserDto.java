package nl.centric.innovation.local4local.dto;

import lombok.Builder;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotNull;

@Builder
public record RegisterCitizenUserDto(@NotNull(message = "First name is required")
                                     String firstName,

                                     @NotNull(message = "Last name is required")
                                     String lastName,

                                     @NotNull(message = "Email is required")
                                     @Email(message = "Invalid email format")
                                     String email,

                                     @NotNull(message = "Pass number is required")
                                     String passNumber,

                                     @NotNull(message = "Password is required")
                                     String password,

                                     @NotNull(message = "Retyped password is required")
                                     String retypedPassword) {
}
