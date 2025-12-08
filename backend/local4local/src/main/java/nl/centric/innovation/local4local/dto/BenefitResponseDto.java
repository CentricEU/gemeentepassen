package nl.centric.innovation.local4local.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.NonNull;
import nl.centric.innovation.local4local.entity.Benefit;
import nl.centric.innovation.local4local.enums.BenefitStatusEnum;

import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Builder
public record BenefitResponseDto(
        @NonNull UUID id,
        @NonNull String name,
        @NonNull String description,
        @NonNull LocalDate startDate,
        @NonNull LocalDate expirationDate,
        @NonNull Double amount,
        BenefitStatusEnum status,
        @JsonInclude(JsonInclude.Include.NON_NULL)
        Set<CitizenGroupViewDto> citizenGroupsDto,
        @JsonInclude(JsonInclude.Include.NON_NULL)
        Double remainingAmount,
        @JsonInclude(JsonInclude.Include.NON_NULL)
        Double spentPercentage
) {

    public BenefitResponseDto(Benefit b) {
        this(
                b.getId(),
                b.getName(),
                b.getDescription(),
                b.getStartDate(),
                b.getExpirationDate(),
                b.getAmount(),
                b.getStatus(),
                null,
                null,
                null
        );
    }

    public static BenefitResponseDto entityToBenefitResponseDto(Benefit benefit) {
        return BenefitResponseDto.builder()
                .id(benefit.getId())
                .name(benefit.getName())
                .description(benefit.getDescription())
                .startDate(benefit.getStartDate())
                .expirationDate(benefit.getExpirationDate())
                .amount(benefit.getAmount())
                .status(benefit.getStatus())
                .citizenGroupsDto(benefit.getCitizenGroups() != null ?
                        benefit.getCitizenGroups().stream()
                                .map(CitizenGroupViewDto::entityToCitizenGroupViewDto)
                                .collect(Collectors.toSet())
                        : null)
                .remainingAmount(null)
                .spentPercentage(null)
                .build();
    }

    // Helper method to enrich with spent amount, remaining and percentage
    public BenefitResponseDto withRemainingAmount(double remaining) {
        double spent = amount() - remaining;
        double percentage = amount() > 0 ? (spent / amount()) * 100 : 0;
        double roundedPercentage = Math.round(percentage * 100.0) / 100.0;
        return BenefitResponseDto.builder()
                .id(id())
                .name(name())
                .description(description())
                .startDate(startDate())
                .expirationDate(expirationDate())
                .amount(amount())
                .status(status())
                .citizenGroupsDto(citizenGroupsDto())
                .remainingAmount(remaining)
                .spentPercentage(roundedPercentage)
                .build();
    }
}
