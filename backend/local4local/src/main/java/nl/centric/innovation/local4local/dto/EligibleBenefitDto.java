package nl.centric.innovation.local4local.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import nl.centric.innovation.local4local.entity.Benefit;

@Builder
public record EligibleBenefitDto(
        @NotBlank String name,
        @NotBlank String description,
        Double amount
) {

    public static EligibleBenefitDto toDto(Benefit benefit) {
        return EligibleBenefitDto.builder()
                .name(benefit.getName())
                .description(benefit.getDescription())
                .amount(benefit.getAmount())
                .build();
    }

    public static EligibleBenefitDto toEligibleDto(BenefitResponseDto benefit) {
        return EligibleBenefitDto.builder()
                .name(benefit.name())
                .description(benefit.description())
                .amount(benefit.amount())
                .build();
    }
}
