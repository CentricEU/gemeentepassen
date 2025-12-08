package nl.centric.innovation.local4local.dto;

import lombok.Builder;

@Builder
public record OfferTransactionTenantTableDto(String passNumber,
                                             String citizenName,
                                             Double amount,
                                             String supplierName,
                                             String benefit,
                                             String createdDate,
                                             String createdTime
) {

}
