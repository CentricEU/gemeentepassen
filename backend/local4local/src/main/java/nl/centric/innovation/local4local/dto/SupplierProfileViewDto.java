package nl.centric.innovation.local4local.dto;

import lombok.Builder;
import lombok.NonNull;
import nl.centric.innovation.local4local.entity.Supplier;
import nl.centric.innovation.local4local.entity.SupplierProfile;
import nl.centric.innovation.local4local.util.annotation.BankDetailsProvider;
import nl.centric.innovation.local4local.util.annotation.ConsistentBankDetails;
import nl.centric.innovation.local4local.util.annotation.ValidBic;
import nl.centric.innovation.local4local.util.annotation.ValidIban;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
import java.util.UUID;

import static nl.centric.innovation.local4local.util.Constants.URL_REGEX;

@ConsistentBankDetails
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
        @NonNull UUID supplierId,
        @NotBlank(message = "IBAN is required")
        @ValidIban
        String iban,
        @ValidBic
        String bic
) implements BankDetailsProvider {
    public static SupplierProfileViewDto entityToSupplierProfileViewDto(Supplier supplier) {
        SupplierProfile supplierProfile = supplier.getProfile();
        return SupplierProfileViewDto.builder()
                .supplierId(supplier.getId())
                .logo(supplierProfile.getLogo())
                .kvkNumber(supplier.getKvk())
                .companyName(supplier.getCompanyName())
                .adminEmail(supplier.getAdminEmail())
                .ownerName(supplierProfile.getOwnerName())
                .legalForm(supplierProfile.getLegalForm().getId())
                .group(supplierProfile.getGroupName().getId())
                .category(supplierProfile.getCategory().getId())
                .subcategory(supplierProfile.getSubcategory() != null ? supplierProfile.getSubcategory().getId() : null)
                .companyBranchAddress(supplierProfile.getCompanyBranchAddress())
                .branchProvince(supplierProfile.getBranchProvince())
                .branchZip(supplierProfile.getBranchZip())
                .branchLocation(supplierProfile.getBranchLocation())
                .branchTelephone(supplierProfile.getBranchTelephone())
                .email(supplierProfile.getEmail())
                .website(supplierProfile.getWebsite())
                .accountManager(supplierProfile.getAccountManager())
                .bic(supplierProfile.getBic())
                .iban(supplierProfile.getIban())
                .build();
    }
}
