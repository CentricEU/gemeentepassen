package nl.centric.innovation.local4local.dto;

import lombok.Builder;
import lombok.NonNull;
import nl.centric.innovation.local4local.dto.group.CreateValidationGroup;
import nl.centric.innovation.local4local.util.annotation.BankDetailsProvider;
import nl.centric.innovation.local4local.util.annotation.ConsistentBankDetails;
import nl.centric.innovation.local4local.util.annotation.ValidBic;
import nl.centric.innovation.local4local.util.annotation.ValidIban;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.Pattern;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static nl.centric.innovation.local4local.util.Constants.URL_REGEX;

@ConsistentBankDetails
@Builder
public record SupplierProfilePatchDto(
        String logo,
        @NotEmpty(message = "Owner name is required")
        String ownerName,
        @NonNull
        Integer legalForm,
        @NonNull
        Integer group,
        @NonNull
        Integer category,
        Integer subcategory,
        @NotBlank(message = "IBAN is required")
        @ValidIban
        String iban,
        @ValidBic
        String bic,
        @NotEmpty(message = "Company branch address is required")
        String companyBranchAddress,
        @NotEmpty(message = "Branch city is required")
        String branchProvince,
        @NotEmpty(message = "Branch zip is required")
        String branchZip,
        @NotEmpty(message = "Branch location is required")
        String branchLocation,
        String branchTelephone,
        @Email(message = "Invalid email format")
        String email,
        @Pattern(regexp = URL_REGEX, message = "Invalid URL format")
        String website,
        @NotEmpty(message = "Account manager is required")
        String accountManager,
        @NonNull
        UUID supplierId,
        @NonNull
        LatLonDto latlon,
        List<WorkingHoursCreateDto> workingHours,
        @NotEmpty(message = "Cashier emails is required", groups = CreateValidationGroup.class)
        Set<String> cashierEmails
) implements BankDetailsProvider {

}

