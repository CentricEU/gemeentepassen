package nl.centric.innovation.local4local.dto;

import lombok.Builder;
import nl.centric.innovation.local4local.enums.FrequencyOfUse;

import java.sql.Time;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Builder
public record RestrictionRequestDto(Integer ageRestriction,
                                    FrequencyOfUse frequencyOfUse,
                                    Integer minPrice,
                                    Integer maxPrice,
                                    LocalDateTime timeFrom,
                                    LocalDateTime timeTo) {
}
