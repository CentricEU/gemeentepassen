package nl.centric.innovation.local4local.dto;

import lombok.Builder;
import nl.centric.innovation.local4local.entity.CitizenGroup;
import nl.centric.innovation.local4local.enums.CitizenAgeGroup;
import nl.centric.innovation.local4local.enums.EligibilityCriteria;
import nl.centric.innovation.local4local.enums.RequiredDocuments;

import javax.validation.constraints.DecimalMax;
import javax.validation.constraints.DecimalMin;
import javax.validation.constraints.Digits;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.math.BigDecimal;

@Builder
public record CitizenGroupDto(

        @NotBlank(message = "Group name is required")
        @Size(max = 64, message = "Group name must not exceed 64 characters")
        String groupName,

        @NotEmpty(message = "At least one age group must be specified")
        CitizenAgeGroup[] ageGroup,
        boolean isDependentChildrenIncluded,

        @NotNull(message = "Threshold amount is required")
        @DecimalMin(value = "1.00", inclusive = true, message = "Threshold amount must be greater than or equal to 1.00")
        @DecimalMax(value = "200.00", inclusive = true, message = "Threshold amount must not exceed 200.00")
        @Digits(integer = 5, fraction = 2, message = "Threshold amount must have up to 5 digits and 2 decimals")
        BigDecimal thresholdAmount,

        @NotNull(message = "Max income is required")
        @DecimalMin(value = "0.00", inclusive = true, message = "Max income must be at least 0.00")
        @DecimalMax(value = "99999999.99", inclusive = true, message = "Max income must not exceed 99,999,999.99")
        @Digits(integer = 8, fraction = 2, message = "Max income must have up to 8 digits and 2 decimals")
        BigDecimal maxIncome,

        @NotEmpty(message = "At least one eligibility criteria must be specified")
        EligibilityCriteria[] eligibilityCriteria,

        @NotEmpty(message = "At least one required document must be specified")
        RequiredDocuments[] requiredDocuments
) {

    public static CitizenGroupDto toDto(CitizenGroup citizenGroup) {
        return CitizenGroupDto.builder()
                .groupName(citizenGroup.getGroupName())
                .ageGroup(citizenGroup.getAgeGroup())
                .isDependentChildrenIncluded(citizenGroup.isDependentChildrenIncluded())
                .thresholdAmount(citizenGroup.getThresholdAmount())
                .maxIncome(citizenGroup.getMaxIncome())
                .eligibilityCriteria(citizenGroup.getEligibilityCriteria())
                .requiredDocuments(citizenGroup.getRequiredDocuments())
                .build();
    }
}
