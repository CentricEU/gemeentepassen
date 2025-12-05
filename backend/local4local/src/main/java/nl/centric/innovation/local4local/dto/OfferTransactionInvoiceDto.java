package nl.centric.innovation.local4local.dto;

import lombok.Builder;
import lombok.NonNull;
import nl.centric.innovation.local4local.entity.OfferTransaction;
import nl.centric.innovation.local4local.util.DateUtils;

import javax.validation.constraints.NotEmpty;

@Builder
public record OfferTransactionInvoiceDto(
        @NotEmpty(message = "Pass number is required")
        String passNumber,
        @NonNull
        Double amount,
        @NotEmpty(message = "Accepted grants are required")
        String acceptedGrants,
        @NotEmpty(message = "Created date is required")
        String createdDate
) {
    public OfferTransactionInvoiceDto(String passNumber, OfferTransaction offerTransaction) {
        this(passNumber,
                offerTransaction.getAmount(),
                offerTransaction.getConcatenatedGrantTitles(),
                DateUtils.formatDateDefault(offerTransaction.getCreatedDate().toLocalDate()));
    }
}
