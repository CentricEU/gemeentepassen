package nl.centric.innovation.local4local.dto;

import lombok.Builder;
import nl.centric.innovation.local4local.entity.OfferType;

@Builder
public record OfferTransactionsGroupedDto(String offerTitle,
                                          String supplierName,
                                          Double amount,
                                          OfferType offerType,
                                          String createdDate) {
}
