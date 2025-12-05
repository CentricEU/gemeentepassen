package nl.centric.innovation.local4local.dto;

import lombok.Builder;

import javax.validation.constraints.DecimalMax;
import javax.validation.constraints.DecimalMin;
import javax.validation.constraints.Digits;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.Pattern;

@Builder
public record CodeValidationRequestDto(
        @NotEmpty(message = "Code is required")
        @Pattern(regexp = "^[0-9A-Za-z]{5}$", message = "Invalid code format")
        String code,
        @NotEmpty(message = "Current time is required")
        String currentTime,
        @DecimalMin(value = "0.00", inclusive = false, message = "Amount must be positive")
        @DecimalMax(value = "999999.99", message = "Amount must not exceed 999,999.99")
        @Digits(integer = 6, fraction = 2, message = "Amount can have up to 6 digits and a maximum of 2 decimal places")
        Double amount
) {
}
