package nl.centric.innovation.local4local.dto;

import lombok.Builder;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

@Builder
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
        @NotEmpty(message = "Grants are required")
        Set<UUID> grantsIds,
        RestrictionRequestDto restrictionRequestDto) {
}
