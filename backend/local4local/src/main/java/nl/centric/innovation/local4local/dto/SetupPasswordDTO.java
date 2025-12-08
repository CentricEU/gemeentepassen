package nl.centric.innovation.local4local.dto;

import lombok.Builder;
import lombok.NonNull;

import java.util.UUID;

@Builder
public record SetupPasswordDTO(@NonNull String token, @NonNull String username, @NonNull String password) {

}