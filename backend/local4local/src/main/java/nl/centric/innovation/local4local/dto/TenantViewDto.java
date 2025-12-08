package nl.centric.innovation.local4local.dto;

import lombok.Builder;
import nl.centric.innovation.local4local.entity.Tenant;

import java.time.LocalDateTime;
import java.util.Base64;
import java.util.UUID;

@Builder
public record TenantViewDto(UUID id,
                            String name,
                            String address,
                            Double wage,
                            LocalDateTime createdDate,
                            String email,
                            String phone,
                            String logo) {

    public static TenantViewDto entityToTenantViewDto(Tenant tenant, boolean isWageIncluded) {
        return TenantViewDto.builder()
                .id(tenant.getId())
                .createdDate(tenant.getCreatedDate())
                .name(tenant.getName())
                .address(tenant.getAddress())
                .wage(isWageIncluded ? tenant.getWage() : null)
                .email(tenant.getEmail())
                .phone(tenant.getPhone())
                .logo(tenant.getLogo() != null
                        ? Base64.getEncoder().encodeToString(tenant.getLogo())
                        : null)
                .build();
    }
}
