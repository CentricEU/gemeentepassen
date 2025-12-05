package nl.centric.innovation.local4local.dto;

import lombok.Builder;

@Builder
public record RegisterCitizenUserDto(String firstName,
                                     String lastName,
                                     String email,
                                     String passNumber,
                                     String password,
                                     String retypedPassword) {
}
