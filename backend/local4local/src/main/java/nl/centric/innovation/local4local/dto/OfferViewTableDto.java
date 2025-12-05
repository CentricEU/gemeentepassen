package nl.centric.innovation.local4local.dto;

import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.Builder;
import nl.centric.innovation.local4local.enums.GenericStatusEnum;

@Builder
public record OfferViewTableDto(UUID id, String title, Double amount, String citizenOfferType, String offerType,
                                String validity, GenericStatusEnum status, String supplierName, UUID supplierId,
                                LocalDate startDate, LocalDate expirationDate, String description,
                                @JsonInclude(JsonInclude.Include.NON_NULL) Set<GrantViewDto> grants) {
}
