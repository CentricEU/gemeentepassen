package nl.centric.innovation.local4local.dto;

import lombok.Builder;
import lombok.NonNull;

import javax.validation.constraints.Digits;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

@Builder
public record BenefitRequestDto(
        @NotBlank(message = "Benefit name is required")
        @Size(max = 64, message = "Benefit name must not exceed 64 characters")
        String name,

        @NotBlank(message = "Description is required")
        @Size(max = 256, message = "Description must not exceed 256 characters")
        String description,

        @NotNull(message = "Start date must is required")
        LocalDate startDate,

        @NotNull(message = "Expiration date is required")
        LocalDate expirationDate,

        @NonNull
        @Digits(integer = 8, fraction = 2, message = "Amount must be a numeric value with up to 8 digits and 2 decimal places.")
        Double amount,

        @NotEmpty(message = "At least one citizen group type must be specified")
        Set<UUID> citizenGroupIds) { }
