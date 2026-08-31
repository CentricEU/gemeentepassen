package nl.centric.innovation.local4local.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import java.util.UUID;

@Builder
public record ApproveOfferDto(
        @NotNull(message = "Offer id is required")  UUID offerId,
        @NotNull(message = "Version is required") Long version
) {
}
