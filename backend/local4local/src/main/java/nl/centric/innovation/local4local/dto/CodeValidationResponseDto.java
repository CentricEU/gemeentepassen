package nl.centric.innovation.local4local.dto;

import lombok.Builder;
import nl.centric.innovation.local4local.entity.DiscountCode;
import nl.centric.innovation.local4local.util.DateUtils;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.Pattern;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Builder
public record CodeValidationResponseDto(
        @NotEmpty(message = "Code is required")
        @Pattern(regexp = "^[0-9A-Za-z]{5}$", message = "Invalid code format")
        String code,
        @NotEmpty(message = "Current time is required")
        String currentTime,
        String offerName,
        Integer offerType
) {

    public static CodeValidationResponseDto toDto(DiscountCode discountCode, LocalTime currentTime) {
        return CodeValidationResponseDto.builder()
                .code(discountCode.getCode())
                .currentTime(DateUtils.formatTime(currentTime))
                .build();
    }

    public static CodeValidationResponseDto toDtoWithOfferDetails(DiscountCode discountCode, LocalTime currentTime) {
        return CodeValidationResponseDto.builder()
                .code(discountCode.getCode())
                .currentTime(DateUtils.formatTime(currentTime))
                .offerName(discountCode.getOffer().getTitle())
                .offerType(discountCode.getOffer().getOfferType().getOfferTypeId())
                .build();
    }
}
