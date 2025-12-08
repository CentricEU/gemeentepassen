package nl.centric.innovation.local4local.dto;

import lombok.Builder;
import nl.centric.innovation.local4local.entity.Supplier;

import java.util.UUID;

@Builder
public record SupplierForMapViewDto(UUID id, String companyName, String coordinatesString) {

    public static SupplierForMapViewDto entityToSupplierForMapViewDto(Supplier supplier) {
        return SupplierForMapViewDto.builder()
                .id(supplier.getId())
                .companyName(supplier.getCompanyName())
                .coordinatesString(supplier.getProfile().getCoordinatesString())
                .build();
    }
}
