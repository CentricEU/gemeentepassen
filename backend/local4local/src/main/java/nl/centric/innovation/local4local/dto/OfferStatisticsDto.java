package nl.centric.innovation.local4local.dto;

import lombok.Builder;

@Builder
public record OfferStatisticsDto(
        Integer offerTypeId,
        String offerTypeLabel,
        Long citizenCount) {
}
