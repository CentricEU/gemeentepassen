package nl.centric.innovation.local4local.dto;

import lombok.Builder;
import nl.centric.innovation.local4local.entity.RejectOffer;

import java.util.UUID;

@Builder
public record OfferRejectionReasonDto(
        UUID offerId,
        String offerTitle,
        String reason
) {
    public static OfferRejectionReasonDto entityToOfferRejectionReasonDto(RejectOffer rejectOffer, String offerTitle) {
        return OfferRejectionReasonDto.builder()
                .offerId(rejectOffer.getOfferId())
                .offerTitle(offerTitle)
                .reason(rejectOffer.getReason())
                .build();
    }
}
