package nl.centric.innovation.local4local.dto;

import lombok.Builder;
import lombok.NonNull;

@Builder
public record ChangePasswordDTO(@NonNull String token, @NonNull String password) {

}