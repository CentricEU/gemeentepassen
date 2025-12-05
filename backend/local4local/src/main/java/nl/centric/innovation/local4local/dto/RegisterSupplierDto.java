package nl.centric.innovation.local4local.dto;

import lombok.Builder;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.util.UUID;

@Builder
public record RegisterSupplierDto(
        @NotEmpty(message = "First name is required")
        String firstName,

        @NotEmpty(message = "Last name is required")
        String lastName,

        @NotEmpty(message = "Company name is required")
        String companyName,

        @NotEmpty(message = "KvK number is required")
        String kvk,

        @NotNull(message = "Tenant ID is required")
        UUID tenantId,

        @NotEmpty(message = "Email is required")
        String email,

        @NotEmpty(message = "Password is required")
        String password,

        @NotEmpty(message = "Retyped password is required")
        String retypedPassword,

        @NotNull(message = "Agreed terms is required")
        Boolean agreedTerms
) {
}
