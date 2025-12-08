package nl.centric.innovation.local4local.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.NonNull;
import nl.centric.innovation.local4local.entity.Benefit;
import nl.centric.innovation.local4local.entity.Offer;
import nl.centric.innovation.local4local.entity.OfferType;
import nl.centric.innovation.local4local.enums.GenericStatusEnum;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import static nl.centric.innovation.local4local.util.ModelConverter.entityToRestrictionViewDto;

@Builder
public record OfferMobileDetailDto(@NonNull UUID id,
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
                                   @NonNull String companyAddress,
                                   @NonNull String companyCategory,
                                   RestrictionViewDto restrictions,
                                   String companyLogo,
                                   @NonNull BenefitLightDto benefit,
                                   @JsonInclude(JsonInclude.Include.NON_NULL)
                                   List<WorkingHoursDto> workingHours,
                                   String discountCode,
                                   @NonNull Boolean isActive


) {

    public static OfferMobileDetailDto entityToOfferMobileDetailDto(Offer offer, Double distance, String discountCode, Boolean isActive) {
        return OfferMobileDetailDto.builder()
                .id(offer.getId())
                .title(offer.getTitle())
                .description(offer.getDescription())
                .amount(offer.getAmount())
                .citizenOfferType(offer.getCitizenOfferType())
                .offerType(offer.getOfferType())
                .startDate(offer.getStartDate())
                .expirationDate(offer.getExpirationDate())
                .coordinatesString(offer.getCoordinatesString())
                .status(offer.getStatus())
                .companyName(offer.getSupplier().getCompanyName())
                .distance(distance)
                .companyAddress(offer.getSupplier().getProfile().getCompanyBranchAddress())
                .companyCategory(offer.getSupplier().getProfile().getCategory().getCategoryLabel())
                .restrictions(offer.getRestriction() != null ? entityToRestrictionViewDto(offer.getRestriction()) : null)
                .companyLogo(offer.getSupplier().getProfile().getLogo())
                .benefit(BenefitLightDto.entityToBenefitTableDto(offer.getBenefit()))
                .workingHours(offer.getSupplier().getWorkingHours().stream().map(WorkingHoursDto::workingHoursEntityToDto).collect(Collectors.toList()))
                .discountCode(discountCode)
                .isActive(isActive)
                .build();
    }
}
