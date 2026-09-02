package nl.centric.innovation.local4local.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import nl.centric.innovation.local4local.entity.Supplier;
import org.javers.core.metamodel.annotation.DiffIgnore;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Builder
public record SupplierRequestPatchDto(
        @NotNull
        @DiffIgnore
        UUID supplierId,

        // supplier information (non-profile)
        @NotEmpty(message = "Company name is required")
        String companyName,

        @NotEmpty(message = "KVK number is required")
        String kvkNumber,

        @NotEmpty(message = "Admin e-mail is required")
        @Email(message = "Invalid email format")
        String adminEmail,

        @NotEmpty(message = "Working hours are required")
        List<WorkingHoursDto> workingHours,

        @Valid
        SupplierProfilePatchDto profile
) {

    public static SupplierRequestPatchDto getSupplierProfilePatchDtoFromEntities(
            Supplier supplier
    ) {
        List<WorkingHoursDto> workingHoursDtos = supplier.getWorkingHours().stream()
                .map(WorkingHoursDto::workingHoursEntityToDto)
                .collect(Collectors.toList());

        return SupplierRequestPatchDto.builder()
                .supplierId(supplier.getId())
                .companyName(supplier.getCompanyName())
                .kvkNumber(supplier.getKvk())
                .adminEmail(supplier.getAdminEmail())
                .workingHours(workingHoursDtos)
                .profile(supplier.getProfile() != null ? SupplierProfilePatchDto.builder()
                        .logo(supplier.getProfile().getLogo())
                        .ownerName(supplier.getProfile().getOwnerName())
                        .legalForm(supplier.getProfile().getLegalForm().getId())
                        .group(supplier.getProfile().getGroupName().getId())
                        .category(supplier.getProfile().getCategory().getId())
                        .subcategory(supplier.getProfile().getSubcategory() != null ? supplier.getProfile().getSubcategory().getId() : null)
                        .iban(supplier.getProfile().getIban())
                        .bic(supplier.getProfile().getBic())
                        .companyBranchAddress(supplier.getProfile().getCompanyBranchAddress())
                        .branchProvince(supplier.getProfile().getBranchProvince())
                        .branchZip(supplier.getProfile().getBranchZip())
                        .branchLocation(supplier.getProfile().getBranchLocation())
                        .branchTelephone(supplier.getProfile().getBranchTelephone())
                        .email(supplier.getProfile().getEmail())
                        .website(supplier.getProfile().getWebsite())
                        .accountManager(supplier.getProfile().getAccountManager())
                        .supplierId(supplier.getId())
                        .latlon(LatLonDto.builder().build())
                        .workingHours(workingHoursDtos.stream()
                                .map(WorkingHoursDto::toCreateDto)
                                .collect(Collectors.toList()))
                        .cashierEmails(Set.of())
                        .build() : null)
                .build();
    }
}
