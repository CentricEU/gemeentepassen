package nl.centric.innovation.local4local.dto;

import lombok.Builder;
import lombok.NonNull;
import nl.centric.innovation.local4local.entity.Offer;
import nl.centric.innovation.local4local.entity.OfferType;

import java.util.UUID;

@Builder
public record OfferMobileMapLightDto(@NonNull UUID id,
                                     @NonNull String title,
                                     @NonNull String description,
                                     @NonNull OfferType offerType,
                                     @NonNull String coordinatesString,
                                     @NonNull Boolean isActive
) {

    public OfferMobileMapLightDto(Offer offer, Boolean isActive) {
        this(offer.getId(),
                offer.getTitle(),
                offer.getDescription(),
                offer.getOfferType(),
                offer.getCoordinatesString(),
                isActive);
    }
}
