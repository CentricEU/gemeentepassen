package nl.centric.innovation.local4local.dto;

import lombok.Builder;
import nl.centric.innovation.local4local.enums.GenericStatusEnum;

import java.util.UUID;

@Builder
public record FilterOfferRequestDto(
        GenericStatusEnum status,
        Integer offerTypeId,
        UUID benefitId) {
}
