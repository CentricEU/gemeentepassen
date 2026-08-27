package nl.centric.innovation.local4local.dto;

import java.util.UUID;

import lombok.Builder;
import nl.centric.innovation.local4local.entity.WorkingHours;
import org.javers.core.metamodel.annotation.DiffIgnore;

@Builder
public record WorkingHoursDto(
        @DiffIgnore UUID id,
        Integer day,
        String openTime,
        String closeTime,
        @DiffIgnore boolean isChecked) {

    public static WorkingHoursDto workingHoursEntityToDto(WorkingHours workingHours) {

        return WorkingHoursDto.builder()
                .openTime(workingHours.getOpenTime().toString())
                .closeTime(workingHours.getCloseTime().toString())
                .day(workingHours.getDay())
                .isChecked(workingHours.getIsChecked())
                .id(workingHours.getId())
                .build();
    }

    public static WorkingHoursCreateDto toCreateDto(WorkingHoursDto workingHoursDto) {
        return WorkingHoursCreateDto.builder()
                .openTime(workingHoursDto.openTime())
                .closeTime(workingHoursDto.closeTime())
                .day(workingHoursDto.day())
                .isChecked(workingHoursDto.isChecked())
                .build();
    }
}
