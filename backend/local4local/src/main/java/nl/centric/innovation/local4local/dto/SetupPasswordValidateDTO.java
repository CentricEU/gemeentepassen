package nl.centric.innovation.local4local.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;


@Builder
public record SetupPasswordValidateDTO(@NotBlank(message = "Token must not be blank") String token,
                                       @NotBlank(message = "Username must not be blank") String username) {

}