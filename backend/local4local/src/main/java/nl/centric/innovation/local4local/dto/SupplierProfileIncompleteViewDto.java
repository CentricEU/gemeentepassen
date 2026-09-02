package nl.centric.innovation.local4local.dto;

import jakarta.validation.constraints.Pattern;
import lombok.Builder;
import lombok.NonNull;
import nl.centric.innovation.local4local.entity.Supplier;
import nl.centric.innovation.local4local.util.annotation.BankDetailsProvider;
import nl.centric.innovation.local4local.util.annotation.ConsistentBankDetails;

import java.util.UUID;

import static nl.centric.innovation.local4local.util.Constants.TELEPHONE_REGEX;
import static nl.centric.innovation.local4local.util.Constants.URL_REGEX;

@ConsistentBankDetails
@Builder
public record SupplierProfileIncompleteViewDto(
        @NonNull String companyName,

        String logo,

        @NonNull String kvkNumber,

        String ownerName,

        Integer legalForm,

        Integer group,

        Integer category,

        Integer subcategory,

        @NonNull String adminEmail,

        String companyBranchAddress,

        String branchProvince,

        String branchZip,

        String branchLocation,

        @Pattern(regexp = TELEPHONE_REGEX, message = "Invalid telephone format")
        String branchTelephone,

        String email,

        @Pattern(regexp = URL_REGEX, message = "Invalid URL format")
        String website,

        String accountManager,

        @NonNull UUID supplierId,

        String iban,

        String bic
) implements BankDetailsProvider, SupplierProfileResult {
    public static SupplierProfileIncompleteViewDto entityToSupplierProfileIncompleteViewDto(Supplier supplier, String ownerName) {
        return SupplierProfileIncompleteViewDto.builder()
                .supplierId(supplier.getId())
                .kvkNumber(supplier.getKvk())
                .ownerName(ownerName)
                .companyName(supplier.getCompanyName())
                .adminEmail(supplier.getAdminEmail())
                .build();
    }
}

