package nl.centric.innovation.local4local.dto;

import lombok.Builder;
import nl.centric.innovation.local4local.enums.SupplierStatusEnum;

import java.util.UUID;

@Builder
public record UserViewDto(
        String companyName,
        String kvkNumber,
        String email,
        SupplierStatusEnum status,
        Boolean isProfileSet,
        Boolean isApproved,
        UUID supplierId) {
}