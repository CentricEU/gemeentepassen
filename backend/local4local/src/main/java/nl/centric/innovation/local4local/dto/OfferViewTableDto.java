package nl.centric.innovation.local4local.dto;

import java.time.LocalDate;
import java.util.UUID;

import lombok.Builder;
import nl.centric.innovation.local4local.entity.Offer;
import nl.centric.innovation.local4local.enums.GenericStatusEnum;
import nl.centric.innovation.local4local.util.ModelConverter;

import static nl.centric.innovation.local4local.util.DateUtils.formatDateDefault;
import static nl.centric.innovation.local4local.util.ModelConverter.entityToRestrictionViewDto;

@Builder
public record OfferViewTableDto(
        UUID id,
        String title,
        Double amount,
        String citizenOfferType,
        String offerType,
        Integer offerTypeId,
        String validity,
        GenericStatusEnum status,
        String supplierName,
        UUID supplierId,
        LocalDate startDate,
        LocalDate expirationDate,
        String description,
        BenefitLightDto benefit,
        RestrictionViewDto restrictionRequestDto,
        Long version) {


    public static OfferViewTableDto entityToOfferViewTableDto(Offer offer) {
        return OfferViewTableDto.builder()
                .id(offer.getId())
                .title(offer.getTitle())
                .supplierName(offer.getSupplier().getCompanyName())
                .supplierId(offer.getSupplier().getId())
                .citizenOfferType("offer.citizenWithPass")
                .startDate(offer.getStartDate())
                .description(offer.getDescription())
                .expirationDate(offer.getExpirationDate())
                .offerType(offer.getOfferType().getOfferTypeLabel())
                .offerTypeId(offer.getOfferType().getOfferTypeId())
                .amount(offer.getAmount())
                .restrictionRequestDto(offer.getRestriction() != null ? entityToRestrictionViewDto(offer.getRestriction()) : null)
                .validity(formatDateDefault(offer.getStartDate()) + " - " + formatDateDefault(offer.getExpirationDate()))
                .status(offer.getStatus())
                .benefit(ModelConverter.entityToBenefitLightDto(offer.getBenefit()))
                .version(offer.getVersion())
                .build();

    }
}
