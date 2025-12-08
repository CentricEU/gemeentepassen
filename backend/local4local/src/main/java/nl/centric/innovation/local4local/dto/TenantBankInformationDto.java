package nl.centric.innovation.local4local.dto;

import nl.centric.innovation.local4local.util.annotation.BankDetailsProvider;
import nl.centric.innovation.local4local.util.annotation.ConsistentBankDetails;
import nl.centric.innovation.local4local.util.annotation.ValidBic;
import nl.centric.innovation.local4local.util.annotation.ValidIban;

import javax.validation.constraints.NotBlank;

@ConsistentBankDetails
public record TenantBankInformationDto(
        @NotBlank(message = "IBAN is required")
        @ValidIban
        String iban,
        @ValidBic
        String bic) implements BankDetailsProvider {
}
