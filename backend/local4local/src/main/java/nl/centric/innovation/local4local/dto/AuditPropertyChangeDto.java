package nl.centric.innovation.local4local.dto;

import lombok.Builder;

@Builder
public record AuditPropertyChangeDto(
        String propertyName,
        String oldValue,
        String newValue
) {
}

