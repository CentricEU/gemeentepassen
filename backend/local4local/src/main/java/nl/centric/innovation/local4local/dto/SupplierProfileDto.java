package nl.centric.innovation.local4local.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import lombok.Builder;


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

