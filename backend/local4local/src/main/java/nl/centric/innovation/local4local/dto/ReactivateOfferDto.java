package nl.centric.innovation.local4local.dto;

import lombok.NonNull;

import java.time.LocalDate;
import java.util.UUID;

public record ReactivateOfferDto(
        @NonNull UUID offerId,
        @NonNull LocalDate startDate,
        @NonNull LocalDate expirationDate
) {}
