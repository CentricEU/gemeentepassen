package nl.centric.innovation.local4local.dto;

import lombok.Builder;
import nl.centric.innovation.local4local.entity.Offer;
import nl.centric.innovation.local4local.entity.OfferTransaction;
import nl.centric.innovation.local4local.entity.User;
import nl.centric.innovation.local4local.util.ModelConverter;

import java.util.stream.Collectors;


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