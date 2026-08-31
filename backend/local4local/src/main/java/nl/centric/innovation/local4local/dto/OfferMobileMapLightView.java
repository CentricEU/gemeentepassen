package nl.centric.innovation.local4local.dto;

import nl.centric.innovation.local4local.entity.OfferType;

import java.util.UUID;

public interface OfferMobileMapLightView {
    UUID getId();
    String getTitle();
    String getDescription();
    OfferType getOfferType();
    String getCoordinatesString();
    Boolean getIsActive();
}
