package nl.centric.innovation.local4local.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.NonNull;
import nl.centric.innovation.local4local.entity.Offer;
import nl.centric.innovation.local4local.entity.OfferType;
import nl.centric.innovation.local4local.enums.GenericStatusEnum;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Builder
public record OfferMobileListDto(
        @NonNull UUID id,
        @NonNull String title,
        @NonNull String description,
        Double amount,
        @NonNull String citizenOfferType,
        @NonNull OfferType offerType,
        @NonNull LocalDate startDate,
        @NonNull LocalDate expirationDate,
        @NonNull String coordinatesString,
        @NonNull GenericStatusEnum status,
        @NonNull String companyName,
        Double distance,
        @NonNull Boolean isActive,
        @JsonInclude(JsonInclude.Include.NON_NULL)
        Set<GrantViewDto> grants,
        @JsonInclude(JsonInclude.Include.NON_NULL)
        List<WorkingHoursDto> workingHours

) {
    public OfferMobileListDto(Offer offer, Double distance, Boolean isActive) {
        this(offer.getId(), offer.getTitle(), offer.getDescription(), offer.getAmount(), offer.getCitizenOfferType(),
                offer.getOfferType(), offer.getStartDate(), offer.getExpirationDate(), offer.getCoordinatesString(),
                offer.getStatus(), offer.getSupplier().getCompanyName(), distance, isActive,
                offer.getGrants().stream().map(GrantViewDto::entityToGrantViewDto).collect(Collectors.toSet()),
                offer.getSupplier().getWorkingHours().stream().map(WorkingHoursDto::workingHoursEntityToDto).collect(Collectors.toList()));
    }

}



