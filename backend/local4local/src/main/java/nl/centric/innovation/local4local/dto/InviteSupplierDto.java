package nl.centric.innovation.local4local.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.util.List;

@Builder
public record InviteSupplierDto(
        @NotNull(message = "Emails list cannot be null")
        List<String> emails,
        @NotNull(message = "Message cannot be null")
        String message
) {
}
