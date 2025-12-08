package nl.centric.innovation.local4local.dto;

import lombok.Builder;
import lombok.NonNull;
import nl.centric.innovation.local4local.entity.User;
import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record UserTableDto(
        @NonNull UUID id,
        @NonNull String fullName,
        @NonNull String email,
        @NonNull LocalDateTime createdDate) {

    public static UserTableDto entityToUserTableDto(User user) {
        return UserTableDto.builder()
                .id(user.getId())
                .fullName(user.getFirstName() + " " + user.getLastName())
                .email(user.getUsername())
                .createdDate(user.getCreatedDate())
                .build();
    }
}
