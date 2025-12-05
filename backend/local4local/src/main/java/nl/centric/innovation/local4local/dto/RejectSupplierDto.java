package nl.centric.innovation.local4local.dto;

import lombok.Builder;
import lombok.NonNull;
import nl.centric.innovation.local4local.enums.RejectionReason;

import java.util.UUID;

@Builder
public record RejectSupplierDto(
        @NonNull RejectionReason reason,
        String comments,
        @NonNull UUID supplierId
) {
}
