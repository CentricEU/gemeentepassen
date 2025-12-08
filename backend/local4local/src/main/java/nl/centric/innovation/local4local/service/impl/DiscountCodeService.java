package nl.centric.innovation.local4local.service.impl;

import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.CodeValidationResponseDto;
import nl.centric.innovation.local4local.dto.DiscountCodeViewDto;
import nl.centric.innovation.local4local.dto.CodeValidationRequestDto;
import nl.centric.innovation.local4local.entity.Benefit;
import nl.centric.innovation.local4local.entity.CitizenBenefit;
import nl.centric.innovation.local4local.entity.DiscountCode;
import nl.centric.innovation.local4local.entity.Offer;
import nl.centric.innovation.local4local.entity.OfferTransaction;
import nl.centric.innovation.local4local.entity.Restriction;
import nl.centric.innovation.local4local.enums.GenericStatusEnum;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.repository.BenefitRepository;
import nl.centric.innovation.local4local.repository.DiscountCodeRepository;
import nl.centric.innovation.local4local.repository.OfferRepository;
import nl.centric.innovation.local4local.util.DateUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Time;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Random;
import java.util.Set;
import java.util.UUID;

import static nl.centric.innovation.local4local.util.Constants.ZERO_AMOUNT;

@Service
@RequiredArgsConstructor
public class DiscountCodeService {

    private final DiscountCodeRepository discountCodeRepository;

    private final OfferRepository offerRepository;

    private final BenefitRepository benefitRepository;

    private final PrincipalService principalService;

    private final CitizenBenefitService citizenBenefitService;

    private final OfferTransactionService offerTransactionService;
    private static final int PERCENTAGE_OFFER_TYPE = 1;

    @Value("${error.entity.notfound}")
    private String errorEntityNotFound;

    @Value("${error.offer.notActive}")
    private String errorOfferNotActive;

    @Value("${error.code.notFoundOrInactive}")
    private String notFoundOrInactive;

    @Value("${error.restriction.timeSlots}")
    private String timeSlotsError;

    @Value("${error.restriction.alreadyUsed}")
    private String alreadyUsed;

    @Value("${error.offer.notActive}")
    private String offerNotActive;

    @Value("${error.restriction.eligiblePrice}")
    private String eligiblePriceError;

    @Value("${error.benefit.amountExceeded}")
    private String amountExceededError;


    public void save(UUID offerId, UUID userId) {
        Optional<DiscountCode> discountCode = discountCodeRepository.findByUserIdAndOfferId(userId, offerId);
        Optional<Offer> offer = offerRepository.findById(offerId);

        if (discountCode.isEmpty()) {
            DiscountCode discountCodeToSave = DiscountCode.of(offer.get(), userId, generateCode(), true);
            discountCodeRepository.save(discountCodeToSave);
        }

    }

    @Transactional
    public DiscountCodeViewDto getDiscountCode(UUID offerId) throws DtoValidateNotFoundException {
        Optional<DiscountCode> discountCode = discountCodeRepository
                .findByUserIdAndOfferId(principalService.getUser().getId(), offerId);

        if (discountCode.isEmpty()) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }

        return DiscountCodeViewDto.of(discountCode.get());

    }

    @Transactional
    public Map<String, List<DiscountCodeViewDto>> getDiscountCodes() {
        List<DiscountCodeViewDto> discountCodes = discountCodeRepository
                .findByUserIdOrderByOfferExpirationDateAndIsActive(principalService.getUser().getId())
                .stream()
                .map(DiscountCodeViewDto::of)
                .toList();

        List<DiscountCodeViewDto> activeDiscountCodes = discountCodes.stream()
                .filter(DiscountCodeViewDto::isActive)
                .toList();

        List<DiscountCodeViewDto> inactiveDiscountCodes = discountCodes.stream()
                .filter(discountCode -> !discountCode.isActive())
                .toList();

        return Map.of("active", activeDiscountCodes, "inactive", inactiveDiscountCodes);
    }

    /**
     * Numbers 0–9 are converted to digits, and 10–35 are mapped to letters A–Z.
     */
    private String generateCode() {
        return new Random().ints(5, 0, 36)
                .mapToObj(i -> i < 10 ? String.valueOf(i) : String.valueOf((char) ('A' + i - 10)))
                .reduce("", String::concat);
    }

    public CodeValidationResponseDto validateAndProcessDiscountCode(CodeValidationRequestDto codeValidationDto) throws DtoValidateException {
        boolean isCustomAmount = codeValidationDto.amount() != null;
        double adjustedAmount = isCustomAmount
                ? calculateDiscountedAmount(codeValidationDto.amount(), validateDiscountCode(codeValidationDto.code()))
                : ZERO_AMOUNT;

        return validateAndProcessDiscountCodeCommon(
                codeValidationDto.code(),
                DateUtils.formatToLocalDateTime(codeValidationDto.currentTime()),
                adjustedAmount,
                isCustomAmount
        );
    }

    @Transactional
    public void deactivateCodeAndSaveTransaction(DiscountCode discountCode, LocalDateTime currentTime, Double amount, CitizenBenefit citizenBenefit) throws DtoValidateException {
        if (!isOfferEligible(discountCode, currentTime, amount, true)) {
            deactivateDiscountCode(discountCode);
        }
        Double transactionAmount = amount != ZERO_AMOUNT ? amount : discountCode.getOffer().getAmount();
        offerTransactionService.saveTransaction(discountCode, transactionAmount, currentTime);
        citizenBenefitService.updateAmount(citizenBenefit.getUserId(), citizenBenefit.getBenefit().getId(), transactionAmount);
    }

    private CodeValidationResponseDto validateAndProcessDiscountCodeCommon(String code, LocalDateTime currentTime, double adjustedAmount, boolean isCustomAmount)
            throws DtoValidateException {
        DiscountCode discountCode = validateDiscountCode(code);

        Benefit benefit = benefitRepository.findById(discountCode.getOffer().getBenefit().getId())
                .orElseThrow(() -> new DtoValidateException(errorEntityNotFound));
        CitizenBenefit citizenBenefit = citizenBenefitService.getCitizenBenefitByUserIdAndBenefit(discountCode.getUserId(), discountCode.getOffer().getBenefit().getId());

        if (adjustedAmount > citizenBenefit.getAmount()) {
            throw new DtoValidateException(amountExceededError);
        }

        if (isSpecialOfferType(discountCode) && !isCustomAmount && isOfferEligible(discountCode, currentTime, adjustedAmount, false)) {
            return CodeValidationResponseDto.toDtoWithOfferDetails(discountCode, currentTime.toLocalTime());
        }

        deactivateCodeAndSaveTransaction(discountCode, currentTime, adjustedAmount, citizenBenefit);
        return CodeValidationResponseDto.toDto(discountCode, currentTime.toLocalTime());
    }

    private double calculateDiscountedAmount(Double originalAmount, DiscountCode discountCode) {
        if (isPercentageDiscount(discountCode)) {
            return originalAmount * (discountCode.getOffer().getAmount() / 100);
        }

        return originalAmount;
    }

    private boolean isPercentageDiscount(DiscountCode discountCode) {
        return discountCode.getOffer().getOfferType().getOfferTypeId() == PERCENTAGE_OFFER_TYPE;
    }

    private boolean isSpecialOfferType(DiscountCode discountCode) {
        // specifically percentage discounts and BOGO offers
        return Set.of(1, 2).contains(discountCode.getOffer().getOfferType().getOfferTypeId());
    }

    private DiscountCode validateDiscountCode(String code) throws DtoValidateException {
        DiscountCode discountCode = discountCodeRepository.findByCodeIgnoreCaseAndIsActiveTrueAndOfferSupplierId(code, supplierId())
                .orElseThrow(() -> new DtoValidateNotFoundException(notFoundOrInactive));

        validateOfferStatus(discountCode.getOffer());

        return discountCode;
    }

    private boolean isOfferEligible(DiscountCode discountCode, LocalDateTime currentTime, Double amount, boolean checkForExistingRestrictions) throws DtoValidateException {

        Offer offer = discountCode.getOffer();
        Restriction restriction = offer.getRestriction();

        if (Objects.isNull(restriction)) {
            return !checkForExistingRestrictions;
        }

        if (checkForExistingRestrictions && restriction.isRestrictionWithoutValidConditions()) {
            return false;
        }

        if (hasFrequencyViolation(discountCode)) {
            throw new DtoValidateException(alreadyUsed);
        }

        Time time = Time.valueOf(currentTime.toLocalTime());

        if (restriction.isTimeOutsideRange(time)) {
            throw new DtoValidateException(timeSlotsError);
        }

        if (hasPriceViolation(restriction, amount, checkForExistingRestrictions)) {
            throw new DtoValidateException(eligiblePriceError);
        }

        return true;
    }

    private void validateOfferStatus(Offer offer) throws DtoValidateException {
        if (offer.getStatus() != GenericStatusEnum.ACTIVE || !offer.isActive()) {
            throw new DtoValidateException(offerNotActive);
        }
    }

    private void deactivateDiscountCode(DiscountCode discountCode) {
        discountCode.setIsActive(false);
        discountCodeRepository.save(discountCode);
    }

    private boolean hasFrequencyViolation(DiscountCode discountCode) {
        Offer offer = discountCode.getOffer();
        Restriction restriction = offer.getRestriction();

        if (Objects.isNull(restriction) || Objects.isNull(restriction.getFrequencyOfUse())) {
            return false;
        }

        Optional<OfferTransaction> lastTransaction = offerTransactionService
                .getLastOfferValidationForCitizen(offer.getId(), discountCode.getUserId());

        if (lastTransaction.isEmpty()) {
            return false;
        }

        OfferTransaction lastOfferTransaction = lastTransaction.get();

        return restriction.isFrequencyViolated(lastOfferTransaction.getCreatedDate());
    }

    private boolean hasPriceViolation(Restriction restriction, Double amount, boolean checkForExistingRestrictions) {

        if (Objects.isNull(restriction) || (Objects.isNull(restriction.getMaxPrice()) && Objects.isNull(restriction.getMinPrice())) ||
                (amount == ZERO_AMOUNT && !checkForExistingRestrictions)) {
            return false;
        }

        return restriction.isPriceViolated(amount);
    }

    private UUID supplierId() {
        return principalService.getSupplierId();
    }

}
