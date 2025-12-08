package nl.centric.innovation.local4local.dto;

import lombok.Builder;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

@Builder
public record CitizenMessageDto(
        @NotNull(message = "Message must not be null")
        @Size(max = 1024, message = "Message must not exceed 1024 characters")
        String message
) {}