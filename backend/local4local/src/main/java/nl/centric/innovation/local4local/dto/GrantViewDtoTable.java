package nl.centric.innovation.local4local.dto;

import lombok.Builder;
import lombok.NonNull;
import nl.centric.innovation.local4local.entity.Grant;
import nl.centric.innovation.local4local.enums.CreatedForEnum;

import java.time.LocalDate;
import java.util.UUID;

@Builder
public record GrantViewDtoTable (@NonNull UUID id, @NonNull String title, @NonNull String description,
                                 @NonNull Integer amount,
                                 @NonNull CreatedForEnum createFor, @NonNull Integer nrBeneficiaries,
                                 @NonNull LocalDate startDate, @NonNull LocalDate expirationDate){

    public static GrantViewDtoTable entityToGrantViewDtoTable(Grant grant) {
        return GrantViewDtoTable.builder()
                .id(grant.getId())
                .title(grant.getTitle())
                .amount(grant.getAmount())
                .createFor(grant.getCreateFor())
                .description(grant.getDescription())
                .startDate(grant.getStartDate())
                .expirationDate(grant.getExpirationDate())
                .nrBeneficiaries(0)
                .build();
    }
}
