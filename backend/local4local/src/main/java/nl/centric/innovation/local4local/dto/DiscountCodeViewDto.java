package nl.centric.innovation.local4local.dto;

import lombok.Builder;
import lombok.NonNull;
import nl.centric.innovation.local4local.entity.DiscountCode;
import nl.centric.innovation.local4local.entity.OfferType;
import nl.centric.innovation.local4local.entity.Supplier;
import nl.centric.innovation.local4local.enums.GenericStatusEnum;

import java.time.LocalDate;

@Builder
public record DiscountCodeViewDto(@NonNull String companyName,

                                  @NonNull OfferType offerType,
                                  @NonNull LocalDate expirationDate,
                                  @NonNull String code,

                                  @NonNull Boolean isActive,
                                  String companyLogo,
                                  Double amount,
                                  @NonNull String offerTitle
) {

    public static DiscountCodeViewDto of(DiscountCode discountCode) {
        Supplier supplier = discountCode.getOffer().getSupplier();
        return DiscountCodeViewDto.builder()
                .companyName(supplier.getCompanyName())
                .offerType(discountCode.getOffer().getOfferType())
                .expirationDate(discountCode.getOffer().getExpirationDate())
                .code(discountCode.getCode())
                .companyLogo(supplier.getProfile().getLogo())
                .amount(discountCode.getOffer().getAmount())
                .isActive(isDiscountCodeActive(discountCode))
                .offerTitle(discountCode.getOffer().getTitle())
                .build();
    }

    private static boolean isDiscountCodeActive(DiscountCode discountCode) {
        return discountCode.getIsActive() && discountCode.getOffer().getStatus() == GenericStatusEnum.ACTIVE;
    }
}
