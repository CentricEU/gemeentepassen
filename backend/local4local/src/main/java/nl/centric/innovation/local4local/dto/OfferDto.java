package nl.centric.innovation.local4local.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.NonNull;
import nl.centric.innovation.local4local.entity.Offer;

import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import static nl.centric.innovation.local4local.util.ModelConverter.entityToRestrictionViewDto;

@Builder
public record OfferDto(@NonNull UUID id,
                       @NonNull String title,
                       @NonNull String description,
                       Double amount,
                       @NonNull String citizenOfferType,
                       @NonNull Integer offerTypeId,
                       @NonNull LocalDate startDate,
                       @NonNull LocalDate expirationDate,
                       @JsonInclude(JsonInclude.Include.NON_NULL)
                       Set<GrantViewDto> grants,
                       RestrictionViewDto restrictionRequestDto
) {
    public static OfferDto entityToOfferDto(Offer offer) {
        return OfferDto.builder()
                .id(offer.getId())
                .title(offer.getTitle())
                .description(offer.getDescription())
                .amount(offer.getAmount())
                .citizenOfferType(offer.getCitizenOfferType())
                .offerTypeId(offer.getOfferType().getOfferTypeId())
                .startDate(offer.getStartDate())
                .expirationDate(offer.getExpirationDate())
                .restrictionRequestDto(offer.getRestriction() != null ? entityToRestrictionViewDto(offer.getRestriction()) : null)
                .grants(offer.getGrants().stream().map(GrantViewDto::entityToGrantViewDto).collect(Collectors.toSet()))
                .build();
    }
}
