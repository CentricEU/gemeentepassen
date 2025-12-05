package nl.centric.innovation.local4local.dto;

import lombok.Builder;
import nl.centric.innovation.local4local.entity.OfferTransaction;

import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record OfferTransactionResponseDto(UUID offerId, UUID citizenId, LocalDateTime usageTime) {

    public static OfferTransactionResponseDto entityToOfferTransactionResponseDto(OfferTransaction transaction) {
        return OfferTransactionResponseDto.builder()
                .offerId(transaction.getDiscountCode().getId())
                .usageTime(transaction.getCreatedDate())
                .build();
    }
}
