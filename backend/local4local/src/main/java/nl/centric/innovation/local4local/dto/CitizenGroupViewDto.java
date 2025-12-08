package nl.centric.innovation.local4local.dto;

import lombok.Builder;
import lombok.NonNull;
import nl.centric.innovation.local4local.entity.CitizenGroup;
import nl.centric.innovation.local4local.enums.CitizenAgeGroup;
import java.math.BigDecimal;
import java.util.UUID;

@Builder
public record CitizenGroupViewDto(
        @NonNull UUID id,
        @NonNull String groupName,
        @NonNull CitizenAgeGroup[] ageGroup,
        @NonNull Boolean isDependentChildrenIncluded,
        @NonNull BigDecimal thresholdAmount,
        @NonNull BigDecimal maxIncome
) {

    public static CitizenGroupViewDto entityToCitizenGroupViewDto(CitizenGroup citizenGroup) {
        return CitizenGroupViewDto.builder()
                .id(citizenGroup.getId())
                .groupName(citizenGroup.getGroupName())
                .ageGroup(citizenGroup.getAgeGroup())
                .isDependentChildrenIncluded(citizenGroup.isDependentChildrenIncluded())
                .thresholdAmount(citizenGroup.getThresholdAmount())
                .maxIncome(citizenGroup.getMaxIncome())
                .build();
    }
}
