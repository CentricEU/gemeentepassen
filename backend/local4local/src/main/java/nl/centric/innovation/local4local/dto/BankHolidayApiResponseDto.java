package nl.centric.innovation.local4local.dto;

import lombok.Builder;

import java.util.List;

@Builder
public record BankHolidayApiResponseDto(
        String date,
        String localName,
        String name,
        String countryCode,
        boolean fixed,
        boolean global,
        List<String> counties,
        Integer launchYear,
        List<String> types) {
}
