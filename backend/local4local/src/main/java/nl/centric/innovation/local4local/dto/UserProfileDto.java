package nl.centric.innovation.local4local.dto;

import lombok.Builder;
import nl.centric.innovation.local4local.entity.User;
import nl.centric.innovation.local4local.entity.UserProfile;

@Builder
public record UserProfileDto(
        String telephone,
        String firstName,
        String lastName,
        String address) {
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