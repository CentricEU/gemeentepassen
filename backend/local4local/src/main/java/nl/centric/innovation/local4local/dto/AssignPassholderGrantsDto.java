package nl.centric.innovation.local4local.dto;

import lombok.Builder;
import lombok.NonNull;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Builder
public record AssignPassholderGrantsDto(@NonNull List<UUID> passholderIds,
                                        @NonNull Set<UUID> grantsIds) {
}
