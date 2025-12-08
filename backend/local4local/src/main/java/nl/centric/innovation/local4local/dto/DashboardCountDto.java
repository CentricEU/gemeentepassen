package nl.centric.innovation.local4local.dto;

import lombok.Builder;

@Builder
public record DashboardCountDto(Integer passholdersCount, Integer suppliersCount, Integer transactionsCount) {
}
