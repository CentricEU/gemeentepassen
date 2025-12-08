package nl.centric.innovation.local4local.dto;

import java.time.LocalDate;
import java.util.Objects;
import java.util.UUID;

import lombok.Builder;
import lombok.NonNull;
import nl.centric.innovation.local4local.entity.Passholder;

@Builder
public record PassholderViewDto(
        @NonNull UUID id,
        @NonNull String name,
        @NonNull String bsn,
        @NonNull LocalDate expiringDate,
        @NonNull String passNumber,
        @NonNull String residenceCity,
        @NonNull String address,
        @NonNull Boolean isRegistered,
        @NonNull String citizenGroupName
) {

    public static PassholderViewDto entityToPassholderViewDto(Passholder passholder) {
        return PassholderViewDto.builder()
                .address(passholder.getAddress())
                .bsn(passholder.getBsn())
                .expiringDate(passholder.getExpiringDate())
                .residenceCity(passholder.getResidenceCity())
                .name(passholder.getName())
                .passNumber(passholder.getPassNumber())
                .id(passholder.getId())
                .isRegistered(!Objects.isNull(passholder.getUser()))
                .citizenGroupName(passholder.getCitizenGroup() != null ?
                        passholder.getCitizenGroup().getGroupName() : "")
                .build();
    }
}
