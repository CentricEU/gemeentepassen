package nl.centric.innovation.local4local.dto;

import lombok.Builder;

@Builder
public record WorkingHoursCreateDto(
        Integer day,
        String openTime,
        String closeTime,
        boolean isChecked) {
}
