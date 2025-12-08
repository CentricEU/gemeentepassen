package nl.centric.innovation.local4local.dto;

import lombok.Builder;
import nl.centric.innovation.local4local.entity.Benefit;

import javax.validation.constraints.NotBlank;

@Builder
public record EligibleBenefitDto(
        @NotBlank String name,
        @NotBlank String description
) {

    public static EligibleBenefitDto toDto(Benefit benefit) {
        return EligibleBenefitDto.builder()
                .name(benefit.getName())
                .description(benefit.getDescription())
                .build();
    }
}
