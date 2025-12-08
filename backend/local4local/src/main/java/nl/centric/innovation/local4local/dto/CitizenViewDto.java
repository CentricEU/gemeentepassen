package nl.centric.innovation.local4local.dto;

import lombok.Builder;
import nl.centric.innovation.local4local.entity.User;

@Builder
public record CitizenViewDto(

        String email,
        String firstName,
        String lastName) {
    public static CitizenViewDto entityToCitizenViewDto(User user) {
        return CitizenViewDto.builder()
                .email(user.getUsername())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .build();
    }
}