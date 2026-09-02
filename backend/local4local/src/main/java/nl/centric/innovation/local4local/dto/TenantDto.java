package nl.centric.innovation.local4local.dto;


import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record TenantDto(
        @NotBlank(message = "Tenant name is required")
        String name,
        String address,

        @NotNull(message = "Wage is required")
        @Digits(integer = 10, fraction = 2,
                message = "Wage must be a numeric value with up to 10 digits and 2 decimal places")
        BigDecimal wage,
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        String email,
        @NotBlank(message = "Phone is required")
        String phone
) {
}
