package nl.centric.innovation.local4local.dto;

import javax.validation.constraints.Digits;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;

public record TenantDto(
        @NotBlank(message = "Tenant name is required")
        String name,
        String address,

        @NotBlank(message = "Wage is required")
        @Digits(integer = 10, fraction = 2,
                message = "Wage must be a numeric value with up to 10 digits and 2 decimal places")
        Double wage,
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        String email,
        @NotBlank(message = "Phone is required")
        String phone
) {
}
