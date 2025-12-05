package nl.centric.innovation.local4local.dto;

import lombok.Builder;

@Builder
public record OfferTransactionTableDto(String passNumber,
                                       String citizenName,
                                       Double amount,
                                       String createdDate,
                                       String createdTime
) {

}
