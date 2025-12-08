package nl.centric.innovation.local4local.dto;

import lombok.Builder;

import javax.validation.constraints.NotBlank;

@Builder
public record SetupPasswordValidateDTO(@NotBlank(message = "Token must not be blank") String token,
                                       @NotBlank(message = "Username must not be blank") String username) {

}