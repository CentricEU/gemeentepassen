package nl.centric.innovation.local4local.dto;

import lombok.Builder;
import nl.centric.innovation.local4local.enums.AuditEventType;

import java.time.LocalDateTime;
import java.util.List;

@Builder
public record AuditTimelineEventDto(
        AuditEventType eventType,
        LocalDateTime timestamp,
        String actorName,
        List<AuditPropertyChangeDto> changes
) {
}

