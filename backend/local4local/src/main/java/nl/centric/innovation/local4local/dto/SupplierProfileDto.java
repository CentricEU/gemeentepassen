package nl.centric.innovation.local4local.dto;

import lombok.Builder;

import javax.validation.Valid;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotEmpty;

@Builder
public record SupplierProfileDto(
        @NotEmpty(message = "Company name is required")
        String companyName,

        @NotEmpty(message = "KVK number is required")
        String kvkNumber,

        @NotEmpty(message = "Admin e-mail is required")
        @Email(message = "Invalid email format")
        String adminEmail,

        @Valid
        SupplierProfilePatchDto supplierProfilePatchDto

) {
}

