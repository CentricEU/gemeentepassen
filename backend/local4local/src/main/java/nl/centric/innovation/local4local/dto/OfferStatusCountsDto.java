package nl.centric.innovation.local4local.dto;

import lombok.Builder;

@Builder
public record OfferStatusCountsDto(long activeCount, long expiredCount, long pendingCount) {
}
