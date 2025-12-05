package nl.centric.innovation.local4local.dto;

import lombok.Builder;

import java.util.UUID;

@Builder
public record SupplierForMapViewDto(UUID id, String companyName, String coordinatesString) {
}
