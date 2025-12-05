package nl.centric.innovation.local4local.dto;

import lombok.Builder;
import lombok.NonNull;

import java.util.UUID;

@Builder
public record RejectOfferDto(
        @NonNull String reason,
        @NonNull UUID offerId
) { }
