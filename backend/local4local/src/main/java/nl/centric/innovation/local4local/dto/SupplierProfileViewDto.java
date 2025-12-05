package nl.centric.innovation.local4local.dto;

import lombok.Builder;
import lombok.NonNull;

import javax.validation.constraints.Pattern;
import java.util.UUID;

import static nl.centric.innovation.local4local.util.Constants.URL_REGEX;

@Builder
public record SupplierProfileViewDto(
        @NonNull String companyName,
        String logo,
        @NonNull String kvkNumber,
        @NonNull String ownerName,
        @NonNull Integer legalForm,
        @NonNull Integer group,
        @NonNull Integer category,
        Integer subcategory,
        @NonNull String adminEmail,
        @NonNull String companyBranchAddress,
        @NonNull String branchProvince,
        @NonNull String branchZip,
        @NonNull String branchLocation,
        String branchTelephone,
        String email,
        @Pattern(regexp = URL_REGEX, message = "Invalid URL format")
        String website,
        @NonNull String accountManager,
        @NonNull UUID supplierId
) {
}
