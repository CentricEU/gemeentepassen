package nl.centric.innovation.local4local.dto;

import lombok.Builder;
import java.util.List;

@Builder
public record InviteSupplierDto(
        List<String> emails,
        String message
) {
}
