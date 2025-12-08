package nl.centric.innovation.local4local.dto;

import lombok.Builder;
import nl.centric.innovation.local4local.entity.User;
import nl.centric.innovation.local4local.entity.UserProfile;

import javax.validation.constraints.NotNull;

@Builder
public record UserProfileDto(
        @NotNull(message = "First name is required")
        String firstName,
        @NotNull(message = "Last name is required")
        String lastName,
        String address,
        String telephone) {
    public static UserProfileDto entityToUserProfileDto(UserProfile userProfile) {
        return UserProfileDto.builder()
                .address(userProfile.getAddress())
                .firstName(userProfile.getUser().getFirstName())
                .lastName(userProfile.getUser().getLastName())
                .telephone(userProfile.getTelephone())
                .build();
    }

    public static UserProfileDto userEntityToUserProfileDto(User user) {
        return UserProfileDto.builder()
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .build();
    }
}