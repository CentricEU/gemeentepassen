package nl.centric.innovation.local4local.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;


@Builder
public record CitizenMessageDto(
        @NotNull(message = "Message must not be null")
        @Size(max = 1024, message = "Message must not exceed 1024 characters")
        String message
) {}