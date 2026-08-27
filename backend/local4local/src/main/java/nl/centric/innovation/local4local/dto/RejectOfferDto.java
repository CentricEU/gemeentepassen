package nl.centric.innovation.local4local.dto;

import lombok.Builder;

import javax.validation.constraints.NotNull;
import java.util.UUID;

@Builder
public record RejectOfferDto(
        @NotNull(message = "Reason is required") String reason,
        @NotNull(message = "Offer id is required") UUID offerId,
        @NotNull(message = "Version is required") Long version
) { }
