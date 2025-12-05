package nl.centric.innovation.local4local.dto;

import java.util.UUID;

import lombok.Builder;
import nl.centric.innovation.local4local.entity.WorkingHours;

@Builder
public record WorkingHoursDto(
        UUID id,
        Integer day,
        String openTime,
        String closeTime,
        boolean isChecked) {

    public static WorkingHoursDto workingHoursEntityToDto(WorkingHours workingHours) {

        return WorkingHoursDto.builder()
                .openTime(workingHours.getOpenTime().toString())
                .closeTime(workingHours.getCloseTime().toString())
                .day(workingHours.getDay())
                .isChecked(workingHours.getIsChecked())
                .id(workingHours.getId())
                .build();
    }
}
