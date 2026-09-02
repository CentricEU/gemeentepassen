package nl.centric.innovation.local4local.dto;

import lombok.Builder;

@Builder
public record FilterPassholdersRequestDto(
        String bsn,
        String passNumber) {
}
