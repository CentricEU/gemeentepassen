package nl.centric.innovation.local4local.dto;

import lombok.Builder;
import lombok.NonNull;
import nl.centric.innovation.local4local.entity.OfferTransaction;
import nl.centric.innovation.local4local.entity.Supplier;
import nl.centric.innovation.local4local.util.DateUtils;

import javax.validation.constraints.NotEmpty;

@Builder
public record OfferTransactionInvoiceTenantDto(
        @NotEmpty(message = "Supplier IBAN is required")
        String supplierIban,
        @NotEmpty(message = "Supplier Name is required")
        String supplierName,
        @NotEmpty(message = "Pass number is required")
        String passNumber,
        @NonNull
        Double amount,
        @NotEmpty(message = "Accepted benefit is required")
        String acceptedBenefit,
        @NotEmpty(message = "Created date is required")
        String createdDate
) {
    public OfferTransactionInvoiceTenantDto(String supplierIban, String supplierName, String passNumber, OfferTransaction offerTransaction) {
        this(supplierIban,
                supplierName,
                passNumber,
                offerTransaction.getAmount(),
                offerTransaction.getOfferBenefitName(),
                DateUtils.formatDateDefault(offerTransaction.getCreatedDate().toLocalDate()));
    }
}
