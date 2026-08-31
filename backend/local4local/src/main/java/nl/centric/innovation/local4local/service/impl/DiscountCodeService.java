package nl.centric.innovation.local4local.service.impl;

import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.CodeValidationResponseDto;
import nl.centric.innovation.local4local.dto.DiscountCodeViewDto;
import nl.centric.innovation.local4local.dto.CodeValidationRequestDto;
import nl.centric.innovation.local4local.entity.CitizenBenefit;
import nl.centric.innovation.local4local.entity.DiscountCode;
import nl.centric.innovation.local4local.entity.Offer;
import nl.centric.innovation.local4local.entity.OfferTransaction;
import nl.centric.innovation.local4local.entity.Restriction;
import nl.centric.innovation.local4local.enums.FrequencyOfUse;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.repository.BenefitRepository;
import nl.centric.innovation.local4local.repository.DiscountCodeRepository;
import nl.centric.innovation.local4local.repository.OfferRepository;
import nl.centric.innovation.local4local.util.Constants;
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

    private static final int PERCENTAGE_OFFER_TYPE = 0;
    private static final int MEMBERSHIP_OFFER_TYPE = 3;

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

    @Value("${error.restriction.eligiblePrice}")
    private String eligiblePriceError;

    @Value("${error.benefit.amountExceeded}")
    private String amountExceededError;

    @Value("${error.offer.notActive}")
    private String offerNotActive;

    public DiscountCodeViewDto save(UUID offerId, UUID userId) throws DtoValidateNotFoundException {
        Optional<DiscountCode> discountCodeOpt = discountCodeRepository.findByUserIdAndOfferId(userId, offerId);
        if (discountCodeOpt.isPresent()) {
            return DiscountCodeViewDto.of(discountCodeOpt.get());
        }

        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new DtoValidateNotFoundException(errorEntityNotFound));

        DiscountCode discountCodeToSave = DiscountCode.of(offer, userId, generateCode(), true);

        return DiscountCodeViewDto.of(discountCodeRepository.save(discountCodeToSave));
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

    public Boolean isDiscountCodeClaimedForOffer(UUID offerId) throws DtoValidateNotFoundException {
        Optional<Offer> offer = offerRepository.findByIdAndSupplierId(offerId, supplierId());

        if (offer.isEmpty()) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }

        return discountCodeRepository.existsByOfferId(offerId);
    }

    public CodeValidationResponseDto validateDiscountCodeAndProcessTransaction(CodeValidationRequestDto codeValidationDto)
            throws DtoValidateException {
        boolean isAmountProvidedByOperator = codeValidationDto.amount() != null;
        DiscountCode discountCode = getActiveUsableDiscountCode(codeValidationDto.code());
        LocalDateTime currentTime = DateUtils.formatToLocalDateTime(codeValidationDto.currentTime());

        validateOfferEligibility(discountCode, currentTime);

        if (shouldPromptOperatorForAmount(discountCode, !isAmountProvidedByOperator)) {
            return CodeValidationResponseDto.toDtoWithOfferDetails(discountCode, currentTime.toLocalTime());
        }

        double amountToUse = isAmountProvidedByOperator
                ? codeValidationDto.amount()
                : getAmountFromBenefitOffer(discountCode.getOffer());


        this.redeemDiscountCodeWithBenefitValidation(discountCode, amountToUse, currentTime);

        return CodeValidationResponseDto.toDto(discountCode, currentTime.toLocalTime());
    }

    public List<DiscountCode> getAllByUserId(UUID userId) {
        return discountCodeRepository.findAllByUserId(userId);
    }

    public List<DiscountCode> saveAll(List<DiscountCode> discountCodes) {
        return discountCodeRepository.saveAll(discountCodes);
    }

    private DiscountCode getActiveUsableDiscountCode(String code) throws DtoValidateException {
        DiscountCode discountCode = discountCodeRepository.findByCodeIgnoreCaseAndIsActiveTrueAndOfferSupplierId(code, supplierId())
                .orElseThrow(() -> new DtoValidateNotFoundException(notFoundOrInactive));

        if(!discountCode.getOffer().isActiveOffer()){
            throw new DtoValidateException(offerNotActive);
        }

        return discountCode;
    }

    private boolean shouldPromptOperatorForAmount(
            DiscountCode discountCode,
            boolean hasNoAmount) {

        return isOfferWithoutAmount(discountCode) && hasNoAmount;
    }

    private void redeemDiscountCodeWithBenefitValidation(DiscountCode discountCode, double amountToUse, LocalDateTime currentTime) throws DtoValidateException {
        benefitRepository.findById(discountCode.getOffer().getBenefit().getId())
                .orElseThrow(() -> new DtoValidateException(errorEntityNotFound));

        CitizenBenefit citizenBenefit = citizenBenefitService.getCitizenBenefitByUserIdAndBenefit(discountCode.getUserId(), discountCode.getOffer().getBenefit().getId());

        if (amountToUse > citizenBenefit.getAmount()) {
            throw new DtoValidateException(amountExceededError);
        }

        processDiscountCodeTransaction(discountCode, currentTime, amountToUse, citizenBenefit);
    }

    @Transactional
    private void processDiscountCodeTransaction(DiscountCode discountCode, LocalDateTime currentTime, Double amount, CitizenBenefit citizenBenefit) throws DtoValidateException {
        Double transactionAmount = amount != Constants.ZERO_AMOUNT ? amount : discountCode.getOffer().getAmount();
        Offer offer = discountCode.getOffer();
        Restriction restriction = offer.getRestriction();

        if (restriction != null && restriction.getFrequencyOfUse() == FrequencyOfUse.SINGLE_USE) {
            deactivateDiscountCode(discountCode);
        }

        offerTransactionService.saveTransaction(discountCode, transactionAmount, currentTime);
        citizenBenefitService.updateAmount(citizenBenefit.getUserId(), citizenBenefit.getBenefit().getId(), transactionAmount);
    }

    /*
    MembershipFee offer has amount already known in the offer creation
     */
    private boolean isOfferWithoutAmount(DiscountCode discountCode) {
        return discountCode.getOffer().getOfferType().getOfferTypeId() != MEMBERSHIP_OFFER_TYPE;
    }

    private void validateOfferEligibility(DiscountCode discountCode, LocalDateTime currentTime)
            throws DtoValidateException {
        Offer offer = discountCode.getOffer();
        Restriction restriction = offer.getRestriction();

        if (restriction == null) {
            return;
        }

        if (hasFrequencyViolation(discountCode)) {
            throw new DtoValidateException(alreadyUsed);
        }

        Time time = Time.valueOf(currentTime.toLocalTime());

        if (restriction.isTimeOutsideRange(time)) {
            throw new DtoValidateException(timeSlotsError);
        }
    }

    private void deactivateDiscountCode(DiscountCode discountCode) {
        discountCode.setIsActive(false);
        discountCodeRepository.save(discountCode);
    }

    private boolean hasFrequencyViolation(DiscountCode discountCode) {
        Offer offer = discountCode.getOffer();
        Restriction restriction = offer.getRestriction();

        if (restriction.getFrequencyOfUse() == null) {
            return false;
        }

        Optional<OfferTransaction> lastTransaction = offerTransactionService
                .getLastOfferValidationForCitizen(
                        offer.getId(),
                        discountCode.getUserId()
                );

        return lastTransaction
                .map(transaction -> restriction.isFrequencyViolated(transaction.getCreatedDate()))
                .orElse(false);
    }

    private UUID supplierId() {
        return principalService.getSupplierId();
    }

    private Double getAmountFromBenefitOffer(Offer offer) {
        return offer.getAmount() != null ? offer.getAmount() : ZERO_AMOUNT;
    }

    /**
     * Numbers 0–9 are converted to digits, and 10–35 are mapped to letters A–Z.
     */
    private String generateCode() {
        return new Random().ints(5, 0, 36)
                .mapToObj(i -> i < 10 ? String.valueOf(i) : String.valueOf((char) ('A' + i - 10)))
                .reduce("", String::concat);
    }

    //Todo: These 2 methods are kept here, in case we'll get back to the percentage discount implementation for some offer types, in the future
    private double calculateDiscountedAmount(Double originalAmount, DiscountCode discountCode) {
        if (isPercentageDiscount(discountCode)) {
            return originalAmount * (discountCode.getOffer().getAmount() / 100);
        }

        return originalAmount;
    }

    private boolean isPercentageDiscount(DiscountCode discountCode) {
        return discountCode.getOffer().getOfferType().getOfferTypeId() == PERCENTAGE_OFFER_TYPE;
    }

    //Todo: price restriction currently hidden
    private boolean hasPriceViolation(Restriction restriction, Double amount) {
        if (Objects.isNull(restriction) || (Objects.isNull(restriction.getMaxPrice()) && Objects.isNull(restriction.getMinPrice())) ||
                (amount == ZERO_AMOUNT)) {
            return false;
        }

        return restriction.isPriceViolated(amount);
    }

}
