package nl.centric.innovation.local4local.dto;

import lombok.Builder;
import nl.centric.innovation.local4local.enums.FrequencyOfUse;

import java.sql.Time;
import java.util.UUID;

@Builder
public record RestrictionViewDto(UUID id,
                                 Integer ageRestriction,
                                 FrequencyOfUse frequencyOfUse,
                                 Integer minPrice,
                                 Integer maxPrice,
                                 Time timeFrom,
                                 Time timeTo) {
}
