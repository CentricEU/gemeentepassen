package nl.centric.innovation.local4local.dto;

import lombok.Builder;
import lombok.NonNull;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.Pattern;
import java.util.List;
import java.util.UUID;

import static nl.centric.innovation.local4local.util.Constants.URL_REGEX;


@Builder
public record SupplierProfileDto(
        @NotEmpty(message = "Company name is required")
        String companyName,
        String logo,
        @NotEmpty(message = "KVK number is required")
        String kvkNumber,
        @NotEmpty(message = "Owner name is required")
        String ownerName,
        @NonNull
        Integer legalForm,
        @NonNull
        Integer group,
        @NonNull
        Integer category,
        Integer subcategory,
        @NotEmpty(message = "Admin e-mail is required")
        @Email(message = "Invalid email format")
        String adminEmail,
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
        List<WorkingHoursCreateDto> workingHours
) {
}
