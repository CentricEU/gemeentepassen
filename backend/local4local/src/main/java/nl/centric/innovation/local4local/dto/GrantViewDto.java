package nl.centric.innovation.local4local.dto;

import lombok.Builder;
import lombok.NonNull;
import nl.centric.innovation.local4local.entity.Grant;
import nl.centric.innovation.local4local.entity.Tenant;
import nl.centric.innovation.local4local.enums.CreatedForEnum;

import java.time.LocalDate;
import java.util.UUID;

@Builder
public record GrantViewDto(@NonNull UUID id, @NonNull String title, @NonNull String description,
                           @NonNull Integer amount,
                           @NonNull CreatedForEnum createFor, @NonNull LocalDate startDate,
                           @NonNull LocalDate expirationDate) {

    public static GrantViewDto entityToGrantViewDto(Grant grant) {
        return GrantViewDto.builder()
                .id(grant.getId())
                .title(grant.getTitle())
                .amount(grant.getAmount())
                .createFor(grant.getCreateFor())
                .description(grant.getDescription())
                .startDate(grant.getStartDate())
                .expirationDate(grant.getExpirationDate())
                .build();
    }
}
