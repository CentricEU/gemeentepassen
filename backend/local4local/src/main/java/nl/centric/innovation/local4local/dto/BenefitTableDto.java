package nl.centric.innovation.local4local.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import nl.centric.innovation.local4local.entity.Benefit;

import javax.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
// Todo: keep a single dto (BenefitTableDto and BenefitResponseDto are almost identical) -> can be merged
public class BenefitTableDto {
    @NotNull
    private UUID id;

    @NotNull
    private String name;

    @NotNull
    private String description;

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate expirationDate;

    @NotNull
    Double amount;

    private Set<CitizenGroupViewDto> citizenGroupsDto;

    private Integer totalBeneficiaries;

    public static BenefitTableDto entityToBenefitTableDto(Benefit benefit) {
        return BenefitTableDto.builder()
                .id(benefit.getId())
                .name(benefit.getName())
                .description(benefit.getDescription())
                .startDate(benefit.getStartDate())
                .expirationDate(benefit.getExpirationDate())
                .citizenGroupsDto(benefit.getCitizenGroups() != null
                        ? benefit.getCitizenGroups().stream()
                        .map(CitizenGroupViewDto::entityToCitizenGroupViewDto)
                        .collect(Collectors.toSet())
                        : null)
                .totalBeneficiaries(0)
                .amount(benefit.getAmount())
                .build();
    }
}
