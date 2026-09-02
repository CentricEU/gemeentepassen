package nl.centric.innovation.local4local.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import nl.centric.innovation.local4local.util.annotation.ValidOfferAmount;

import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

@Builder
@ValidOfferAmount
public record OfferRequestDto(
        @NotEmpty(message = "Title is required")
        String title,
        @NotEmpty(message = "Description is required")
        @Size(max = 1024, message = "Description must be at most 1024 characters long")
        String description,
        @NotEmpty(message = "Citizen offer type is required")
        String citizenOfferType,
        Double amount,
        @NotNull(message = "Offer type is required")
        Integer offerTypeId,
        @NotNull(message = "Start date is required")
        LocalDate startDate,
        @NotNull(message = "Expiration date is required")
        LocalDate expirationDate,
        @NotEmpty(message = "Benefit ids are required")
        Set<UUID> benefitIds,
        @NotNull(message = "Version is required")
        Long version,
        RestrictionRequestDto restrictionRequestDto) {
}
