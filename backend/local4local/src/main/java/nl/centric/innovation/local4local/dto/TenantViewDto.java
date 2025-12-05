package nl.centric.innovation.local4local.dto;

import lombok.Builder;

import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record TenantViewDto(UUID id,
                            String name,
                            String address,
                            LocalDateTime createdDate) {

}
