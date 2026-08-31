package nl.centric.innovation.local4local.dto;

import lombok.Builder;
import lombok.NonNull;

import java.util.UUID;

@Builder
public record OfferDownloadRequestDto(@NonNull UUID offerId, @NonNull UUID passholderId, @NonNull String currentTime, Double amount) { }

