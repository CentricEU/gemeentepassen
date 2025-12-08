package nl.centric.innovation.local4local.dto;

import lombok.Builder;

import javax.validation.constraints.NotNull;
import java.util.List;

@Builder
public record InviteSupplierDto(
        @NotNull(message = "Emails list cannot be null")
        List<String> emails,
        @NotNull(message = "Message cannot be null")
        String message
) {
}
