package nl.centric.innovation.local4local.dto;

import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.Builder;
import lombok.NonNull;
import nl.centric.innovation.local4local.entity.OfferType;
import nl.centric.innovation.local4local.enums.GenericStatusEnum;

@Builder
public record OfferDetailsViewDto(@NonNull UUID id,
                                  @NonNull String title,
                                  @NonNull String description,
                                  Double amount,
                                  @NonNull String citizenOfferType,
                                  @NonNull OfferType offerType,
                                  @NonNull LocalDate startDate,
                                  @NonNull LocalDate expirationDate,
                                  @NonNull GenericStatusEnum status,
                                  @NonNull String companyName,
                                  @NonNull String companyAddress,
                                  RestrictionViewDto restrictions,
                                  String companyLogo,
                                  @JsonInclude(JsonInclude.Include.NON_NULL)
                                  Set<GrantViewDto> grants,
                                  OfferTransactionResponseDto lastOfferTransaction

) {
}
