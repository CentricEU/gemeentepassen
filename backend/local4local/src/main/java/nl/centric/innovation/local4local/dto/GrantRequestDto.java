package nl.centric.innovation.local4local.dto;

import lombok.Builder;
import lombok.NonNull;
import nl.centric.innovation.local4local.enums.CreatedForEnum;

import java.time.LocalDate;

@Builder
public record GrantRequestDto(@NonNull String title, @NonNull String description, @NonNull Integer amount,
                              @NonNull CreatedForEnum createFor, @NonNull LocalDate startDate,
                              @NonNull LocalDate expirationDate) {
}
