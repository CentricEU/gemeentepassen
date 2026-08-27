package nl.centric.innovation.local4local.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import lombok.Builder;
import lombok.NonNull;
import nl.centric.innovation.local4local.util.annotation.BankDetailsProvider;
import nl.centric.innovation.local4local.util.annotation.ConsistentBankDetails;
import nl.centric.innovation.local4local.util.annotation.ValidBic;
import nl.centric.innovation.local4local.util.annotation.ValidIban;
import org.javers.core.metamodel.annotation.DiffIgnore;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import static nl.centric.innovation.local4local.util.Constants.TELEPHONE_REGEX;
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

        String branchProvince,

        @NotEmpty(message = "Branch zip is required")
        String branchZip,

        @NotEmpty(message = "Branch location is required")
        String branchLocation,

        @Pattern(regexp = TELEPHONE_REGEX, message = "Invalid telephone format")
        String branchTelephone,

        @Email(message = "Invalid email format")
        String email,

        @Pattern(regexp = URL_REGEX, message = "Invalid URL format")
        String website,

        @NotEmpty(message = "Account manager is required")
        String accountManager,

        @DiffIgnore
        @NonNull
        UUID supplierId,

        @DiffIgnore
        @NonNull
        LatLonDto latlon,

        @DiffIgnore
        List<WorkingHoursCreateDto> workingHours,

        @DiffIgnore
        Set<String> cashierEmails
) implements BankDetailsProvider {

}

