package nl.centric.innovation.local4local.dto;

import lombok.Builder;
import nl.centric.innovation.local4local.enums.FrequencyOfUse;

import java.time.LocalDateTime;

@Builder
public record RestrictionRequestDto(
        FrequencyOfUse frequencyOfUse,
        LocalDateTime timeFrom,
        LocalDateTime timeTo) {
}
