package nl.centric.innovation.local4local.unit;

import lombok.SneakyThrows;
import nl.centric.innovation.local4local.dto.CodeValidationRequestDto;
import nl.centric.innovation.local4local.dto.CodeValidationResponseDto;
import nl.centric.innovation.local4local.dto.DiscountCodeViewDto;
import nl.centric.innovation.local4local.entity.Benefit;
import nl.centric.innovation.local4local.entity.CitizenBenefit;
import nl.centric.innovation.local4local.entity.DiscountCode;
import nl.centric.innovation.local4local.entity.Offer;
import nl.centric.innovation.local4local.entity.OfferTransaction;
import nl.centric.innovation.local4local.entity.OfferType;
import nl.centric.innovation.local4local.entity.Restriction;
import nl.centric.innovation.local4local.entity.Supplier;
import nl.centric.innovation.local4local.entity.SupplierProfile;
import nl.centric.innovation.local4local.entity.User;
import nl.centric.innovation.local4local.enums.FrequencyOfUse;
import nl.centric.innovation.local4local.enums.GenericStatusEnum;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.repository.BenefitRepository;
import nl.centric.innovation.local4local.repository.DiscountCodeRepository;
import nl.centric.innovation.local4local.repository.OfferRepository;
import nl.centric.innovation.local4local.service.impl.CitizenBenefitService;
import nl.centric.innovation.local4local.service.impl.DiscountCodeService;
import nl.centric.innovation.local4local.service.impl.OfferService;
import nl.centric.innovation.local4local.service.impl.OfferTransactionService;
import nl.centric.innovation.local4local.service.impl.PrincipalService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Method;
import java.sql.Time;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.doNothing;

@ExtendWith(MockitoExtension.class)
class DiscountCodeServiceTests {

    @Mock
    private DiscountCodeRepository discountCodeRepository;

    @Mock
    private OfferRepository offerRepository;

    @Mock
    private BenefitRepository benefitRepository;

    @Mock
    private CitizenBenefitService citizenBenefitService;

    @Mock
    private PrincipalService principalService;

    @Mock
    private OfferTransactionService offerTransactionService;

    @Mock
    private OfferService offerService;

    @InjectMocks
    private DiscountCodeService discountCodeService;

    @Mock
    private DiscountCode discountCode;


    private UUID userId;
    private UUID offerId;

    private Offer offer;

    private UUID supplierId;
    private Benefit benefit;

    @BeforeEach
    void setup() {
        supplierId = UUID.randomUUID();

        // Setup Benefit
        benefit = new Benefit();
        benefit.setId(UUID.randomUUID());
        benefit.setAmount(200.0);

        // Setup Offer
        offer = new Offer();
        OfferType offerType = new OfferType();
        offerType.setOfferTypeId(1);
        offer.setId(UUID.randomUUID());
        offer.setOfferType(new OfferType());
        offer.setBenefit(benefit);
        offer.setStatus(GenericStatusEnum.ACTIVE);
        offer.setOfferType(offerType);
        offer.setActive(true);
        offer.setAmount(200.0);

        // Setup DiscountCode
        discountCode = new DiscountCode();
        discountCode.setCode("VALID123");
        discountCode.setIsActive(true);
        discountCode.setOffer(offer);
    }

    @Test
    void GivenInvalidDiscountCodeWithAmount_WhenValidateAndProcessDiscountCodeWithAmount_ThenThrowDtoValidateException() {
        // Given
        String invalidCode = "INVALID";
        double amount = 100.0;

        when(principalService.getSupplierId()).thenReturn(supplierId);
        when(discountCodeRepository.findByCodeIgnoreCaseAndIsActiveTrueAndOfferSupplierId(invalidCode, supplierId)).thenReturn(Optional.empty());

        // Then
        assertThrows(DtoValidateException.class, () -> discountCodeService.validateDiscountCodeAndProcessTransaction(new CodeValidationRequestDto(invalidCode, "01/15/2026, 12:00:00", amount)));
    }

    @Test
    void GivenInactiveOffer_WhenValidateAndProcessDiscountCodeWithAmount_ThenThrowDtoValidateException() {
        // Given
        String validCode = "JV12A";
        double amount = 100.0;

        offer.setId(offerId);
        offer.setStatus(GenericStatusEnum.EXPIRED);
        offer.setActive(false);

        DiscountCode discountCode = new DiscountCode();
        discountCode.setCode(validCode);
        discountCode.setIsActive(true);
        discountCode.setOffer(offer);

        when(principalService.getSupplierId()).thenReturn(supplierId);
        when(discountCodeRepository.findByCodeIgnoreCaseAndIsActiveTrueAndOfferSupplierId(validCode, supplierId)).thenReturn(Optional.of(discountCode));

        // Then
        assertThrows(DtoValidateException.class, () -> discountCodeService.validateDiscountCodeAndProcessTransaction(new CodeValidationRequestDto(validCode, "01/15/2026, 12:00:00", amount)));
    }

    @Test
    void TestSave_WhenDiscountCodeNotExist() throws DtoValidateNotFoundException {
        // Arrange
        UUID userId = UUID.randomUUID();
        UUID offerId = UUID.randomUUID();
        Offer offer = new Offer();
        offer.setSupplier(Supplier.builder()
                .companyName("Company")
                .profile(SupplierProfile.builder().logo("logo").build())
                .build());
        offer.setOfferType(OfferType.builder().build());
        offer.setExpirationDate(LocalDate.now());
        offer.setTitle("Special Offer");
        offer.setId(offerId);

        DiscountCode discountCode = new DiscountCode();
        discountCode.setCode("JV12A");
        discountCode.setIsActive(true);
        discountCode.setOffer(offer);

        discountCode.setOffer(offer);
        discountCode.setUserId(userId);

        when(discountCodeRepository.findByUserIdAndOfferId(userId, offerId)).thenReturn(Optional.of(discountCode));

        // Act
        DiscountCodeViewDto result = discountCodeService.save(offerId, userId);

        // Assert
        assertNotNull(result);
    }

    @Test
    void testSave_WhenDiscountCodeAlreadyExists() throws DtoValidateNotFoundException {
        // Given
        UUID userId = UUID.randomUUID();
        UUID offerId = UUID.randomUUID();
        Offer offer = new Offer();
        offer.setSupplier(Supplier.builder()
                .companyName("Company")
                .profile(SupplierProfile.builder().logo("logo").build())
                .build());
        offer.setOfferType(OfferType.builder().build());
        offer.setExpirationDate(LocalDate.now());
        offer.setTitle("Special Offer");

        DiscountCode discountCode = new DiscountCode();
        discountCode.setCode("JV12A");
        discountCode.setIsActive(true);
        discountCode.setOffer(offer);

        User user = new User();
        user.setId(userId);
        offer.setId(offerId);
        discountCode.setOffer(offer);
        discountCode.setUserId(userId);

        when(discountCodeRepository.findByUserIdAndOfferId(userId, offerId)).thenReturn(Optional.of(discountCode));

        // When
        DiscountCodeViewDto result = discountCodeService.save(offerId, userId);

        // Then
        assertNotNull(result);

    }


    @Test
    void GivenValidRequest_WhenSaveDiscountCode_ThenExpectSuccess() throws DtoValidateNotFoundException {
        //Given
        UUID userId = UUID.randomUUID();
        UUID offerId = UUID.randomUUID();
        Offer offer = new Offer();
        offer.setSupplier(Supplier.builder()
                .companyName("Company")
                .profile(SupplierProfile.builder().logo("logo").build())
                .build());
        offer.setOfferType(OfferType.builder().build());
        offer.setExpirationDate(LocalDate.now());
        offer.setTitle("Special Offer");

        DiscountCode discountCode = new DiscountCode();
        discountCode.setCode("JV12A");
        discountCode.setIsActive(true);
        discountCode.setOffer(offer);

        User user = new User();
        user.setId(userId);

        // Arrange
        when(discountCodeRepository.findByUserIdAndOfferId(userId, offerId)).thenReturn(Optional.of(discountCode));

        offer.setId(offerId);  // Make sure you set the Offer ID

        // Act
        DiscountCodeViewDto result = discountCodeService.save(offerId, userId);
        assertNotNull(result);
    }

    @Test
    void GivenExistingDiscountCode_WhenSaveDiscountCode_ThenDoNotSaveAgain() throws DtoValidateNotFoundException {
        // Given
        Offer offer = new Offer();
        offer.setSupplier(Supplier.builder()
                .companyName("Company")
                .profile(SupplierProfile.builder().logo("logo").build())
                .build());
        offer.setOfferType(OfferType.builder().build());
        offer.setExpirationDate(LocalDate.now());
        offer.setTitle("Special Offer");

        DiscountCode discountCode = new DiscountCode();
        discountCode.setCode("JV12A");
        discountCode.setIsActive(true);
        discountCode.setOffer(offer);
        discountCode.setOffer(offer);

        User user = new User();
        user.setId(userId);


        // When
        when(discountCodeRepository.findByUserIdAndOfferId(userId, offerId)).thenReturn(Optional.of(discountCode));

        // Then
        discountCodeService.save(offerId, userId);

        verify(discountCodeRepository, never()).save(any(DiscountCode.class));
    }

    @Test
    @SneakyThrows
    void GivenValidRequest_WhenGetDiscountCode_ThenExpectSuccess() {
        // Given
        User user = new User();
        user.setId(userId);

        offer.setSupplier(Supplier.builder()
                .companyName("Company")
                .profile(SupplierProfile.builder().logo("logo").build())
                .build());
        offer.setOfferType(OfferType.builder().build());
        offer.setExpirationDate(LocalDate.now());
        offer.setTitle("Special Offer");

        DiscountCode discountCode = new DiscountCode();
        discountCode.setCode("JV12A");
        discountCode.setIsActive(true);
        discountCode.setOffer(offer); // Ensure offer is set

        // When
        when(principalService.getUser()).thenReturn(user);
        when(discountCodeRepository.findByUserIdAndOfferId(userId, offerId)).thenReturn(Optional.of(discountCode));

        // Then
        DiscountCodeViewDto result = discountCodeService.getDiscountCode(offerId);

        assertNotNull(result);
    }

    @Test
    void GivenInvalidCodeFormat_WhenValidateDiscountCode_ThenThrowDtoValidateException() {
        // Given
        String invalidCode = "12!A";

        // Then
        assertThrows(DtoValidateException.class,
                () -> discountCodeService.validateDiscountCodeAndProcessTransaction(new CodeValidationRequestDto(invalidCode, "01/27/2025, 17:50:50", null)));
    }

    @Test
    void GivenCodeOutsideTimeSlot_WhenValidateDiscountCode_ThenThrowDtoValidateException() {
        // Given
        String discountCode = "DEF34";
        String currentTime = "01/27/2025, 17:50:50";
        DiscountCode discount = new DiscountCode();
        discount.setCode(discountCode);
        discount.setIsActive(true);

        offer.setId(offerId);
        offer.setStatus(GenericStatusEnum.ACTIVE);
        OfferType offerType = new OfferType(0, "test", true);
        offer.setOfferType(offerType);
        offer.setActive(true);

        Restriction restriction = new Restriction();
        restriction.setTimeFrom(Time.valueOf("12:00:00"));
        restriction.setTimeTo(Time.valueOf("15:00:00"));
        offer.setRestriction(restriction);

        discount.setOffer(offer);

        when(principalService.getSupplierId()).thenReturn(supplierId);
        when(discountCodeRepository.findByCodeIgnoreCaseAndIsActiveTrueAndOfferSupplierId(discountCode, supplierId)).thenReturn(Optional.of(discount));
        lenient().when(offerRepository.findById(offer.getId())).thenReturn(Optional.of(offer));

        // Then
        assertThrows(DtoValidateException.class, () ->
                discountCodeService.validateDiscountCodeAndProcessTransaction(new CodeValidationRequestDto(discountCode, currentTime, null))
        );
    }

    @Test
    @SneakyThrows
    void GivenValidDiscountCode_WhenHasFrequencyViolationUsingReflection_ThenExpectFalse() {
        // Given
        DiscountCode discountCode = mock(DiscountCode.class);
        Offer mockedOffer = mock(Offer.class);
        Restriction restriction = mock(Restriction.class);

        when(discountCode.getOffer()).thenReturn(mockedOffer);
        when(mockedOffer.getRestriction()).thenReturn(restriction);

        Method method = DiscountCodeService.class.getDeclaredMethod("hasFrequencyViolation", DiscountCode.class);
        method.setAccessible(true);

        // Invoke the private method
        boolean result = (boolean) method.invoke(discountCodeService, discountCode);

        // Verify
        assertFalse(result);
    }

    @Test
    @SneakyThrows
    void GivenInactiveOffer_WhenValidateDiscountCode_ThenThrowDtoValidateException() {
        // Given
        String validCode = "JV12A";

        offer.setId(offerId);
        offer.setStatus(GenericStatusEnum.EXPIRED);
        offer.setActive(true);

        DiscountCode discountCode = new DiscountCode();
        discountCode.setCode(validCode);
        discountCode.setIsActive(true);
        discountCode.setOffer(offer);

        when(principalService.getSupplierId()).thenReturn(supplierId);
        when(discountCodeRepository.findByCodeIgnoreCaseAndIsActiveTrueAndOfferSupplierId(validCode, supplierId)).thenReturn(Optional.of(discountCode));

        // When & Then
        assertThrows(DtoValidateException.class, () -> discountCodeService.validateDiscountCodeAndProcessTransaction(new CodeValidationRequestDto(validCode, "01/27/2025, 17:50:50", null)));
    }

    @Test
    @SneakyThrows
    void TestHasFrequencyViolation_WhenTransactionExists() {
        // Given
        Restriction restriction = new Restriction();
        restriction.setFrequencyOfUse(FrequencyOfUse.DAILY);

        offer.setRestriction(restriction);

        DiscountCode discountCode = new DiscountCode();
        discountCode.setCode("JV12A");
        discountCode.setUserId(userId);
        discountCode.setOffer(offer);

        OfferTransaction lastOfferTransaction = new OfferTransaction();
        lastOfferTransaction.setCreatedDate(LocalDateTime.now().minusDays(1));

        when(offerTransactionService.getLastOfferValidationForCitizen(any(), any()))
                .thenReturn(Optional.of(lastOfferTransaction));

        Method method = DiscountCodeService.class.getDeclaredMethod("hasFrequencyViolation", DiscountCode.class);
        method.setAccessible(true);

        boolean result = (boolean) method.invoke(discountCodeService, discountCode);

        // Then & Verify
        assertFalse(result);
    }

    @Test
    void GivenCodeOutsideEligiblePriceRange_WhenValidateDiscountCode_ThenThrowDtoValidateException() {
        // Given
        String discountCode = "DEF34";
        String currentTime = "01/27/2025, 17:50:50";
        DiscountCode discount = new DiscountCode();
        discount.setCode(discountCode);
        discount.setIsActive(true);

        offer.setId(offerId);
        offer.setStatus(GenericStatusEnum.ACTIVE);
        OfferType offerType = new OfferType(0, "test", true);
        offer.setOfferType(offerType);
        offer.setActive(true);

        Restriction restriction = new Restriction();
        restriction.setMinPrice(10);
        restriction.setMaxPrice(20);
        offer.setRestriction(restriction);

        discount.setOffer(offer);

        when(principalService.getSupplierId()).thenReturn(supplierId);
        when(discountCodeRepository.findByCodeIgnoreCaseAndIsActiveTrueAndOfferSupplierId(discountCode, supplierId)).thenReturn(Optional.of(discount));
        lenient().when(offerRepository.findById(offer.getId())).thenReturn(Optional.of(offer));

        // Then
        assertThrows(DtoValidateException.class, () ->
                discountCodeService.validateDiscountCodeAndProcessTransaction(new CodeValidationRequestDto(discountCode, currentTime, 30.0))
        );
    }

    @Test
    void GivenValidUser_WhenGetDiscountCodes_ThenExpectActiveAndInactiveDiscountCodes() {
        // Given
        User user = new User();
        user.setId(userId);

        Offer activeOffer = new Offer();
        activeOffer.setSupplier(Supplier.builder()
                .companyName("Company")
                .profile(SupplierProfile.builder().logo("logo").build())
                .build());
        activeOffer.setOfferType(OfferType.builder().build());
        activeOffer.setStatus(GenericStatusEnum.ACTIVE);
        activeOffer.setExpirationDate(LocalDate.now().plusDays(1));
        activeOffer.setTitle("Active Offer");
        DiscountCode activeDiscountCode = new DiscountCode();
        activeDiscountCode.setCode("ABC123");
        activeDiscountCode.setIsActive(true);
        activeDiscountCode.setOffer(activeOffer);

        Offer inactiveOffer = new Offer();
        inactiveOffer.setSupplier(Supplier.builder()
                .companyName("Company")
                .profile(SupplierProfile.builder().logo("logo").build())
                .build());
        inactiveOffer.setOfferType(OfferType.builder().build());
        inactiveOffer.setExpirationDate(LocalDate.now().minusDays(1));
        inactiveOffer.setTitle("Inactive Offer"); // Set non-null title
        DiscountCode inactiveDiscountCode = new DiscountCode();
        inactiveDiscountCode.setCode("ABC124");
        inactiveDiscountCode.setIsActive(false);
        inactiveDiscountCode.setOffer(inactiveOffer);

        when(principalService.getUser()).thenReturn(user);
        when(discountCodeRepository.findByUserIdOrderByOfferExpirationDateAndIsActive(userId))
                .thenReturn(List.of(activeDiscountCode, inactiveDiscountCode));

        // When
        Map<String, List<DiscountCodeViewDto>> result = discountCodeService.getDiscountCodes();

        // Then
        Assertions.assertNotNull(result);
        Assertions.assertEquals(1, result.get("active").size());
        Assertions.assertEquals(1, result.get("inactive").size());
        Assertions.assertTrue(result.get("active").get(0).isActive());
        Assertions.assertFalse(result.get("inactive").get(0).isActive());
    }

    @Test
    @SneakyThrows
    void GivenValidDiscountCode_WhenValidateAndProcessDiscountCode_ThenExpectSuccess() {
        // Given
        double adjustedAmount = 50.0;
        UUID benefitId = UUID.randomUUID();
        CitizenBenefit citizenBenefit = CitizenBenefit.builder().benefit(benefit).amount(200.0).build();

        when(citizenBenefitService.getCitizenBenefitByUserIdAndBenefit(any(), any())).thenReturn(citizenBenefit);

        when(principalService.getSupplierId()).thenReturn(supplierId);
        when(discountCodeRepository.findByCodeIgnoreCaseAndIsActiveTrueAndOfferSupplierId("VALID123", supplierId))
                .thenReturn(Optional.of(discountCode));
        when(benefitRepository.findById(benefit.getId())).thenReturn(Optional.of(benefit));

        doNothing().when(offerTransactionService).saveTransaction(any(DiscountCode.class), any(Double.class), any(LocalDateTime.class));
        // When
        CodeValidationResponseDto result = discountCodeService.validateDiscountCodeAndProcessTransaction(
                new CodeValidationRequestDto("VALID123", "01/27/2025, 12:00:00", adjustedAmount));

        // Then
        assertNotNull(result);
        assertEquals("VALID123", result.code());
    }

    @Test
    @SneakyThrows
    void GivenSpecialOfferAndEligible_WhenValidateAndProcessDiscountCode_ThenReturnOfferDetails() {
        String code = "VALID123";
        String now = "01/27/2025, 12:00:00";
        CitizenBenefit citizenBenefit = CitizenBenefit.builder().amount(200.0).build();
        // Mocks
        when(principalService.getSupplierId()).thenReturn(supplierId);
        when(discountCodeRepository.findByCodeIgnoreCaseAndIsActiveTrueAndOfferSupplierId(code, supplierId))
                .thenReturn(Optional.of(discountCode));
        // Call - amount null -> treated as ZERO_AMOUNT -> not a custom amount
        CodeValidationResponseDto response = discountCodeService.validateDiscountCodeAndProcessTransaction(new CodeValidationRequestDto(code, now, null));

        // Expectation: special offer branch returns DTO with offer details (code preserved)
        assertEquals("VALID123", response.code());
    }

    @Test
    void GivenOfferNotFound_WhenIsOfferClaimed_ThenThrowDtoValidateNotFoundException() {
        UUID offerIdLocal = UUID.randomUUID();

        when(principalService.getSupplierId()).thenReturn(supplierId);
        when(offerRepository.findByIdAndSupplierId(offerIdLocal, supplierId)).thenReturn(Optional.empty());

        assertThrows(nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException.class,
                () -> discountCodeService.isDiscountCodeClaimedForOffer(offerIdLocal));
    }

    @Test
    @SneakyThrows
    void GivenOfferExists_WhenIsOfferClaimed_ThenReturnTrue() {
        UUID offerIdLocal = UUID.randomUUID();
        Offer foundOffer = new Offer();

        when(principalService.getSupplierId()).thenReturn(supplierId);
        when(offerRepository.findByIdAndSupplierId(offerIdLocal, supplierId)).thenReturn(Optional.of(foundOffer));
        when(discountCodeRepository.existsByOfferId(offerIdLocal)).thenReturn(true);

        Boolean result = discountCodeService.isDiscountCodeClaimedForOffer(offerIdLocal);

        Assertions.assertTrue(result);
    }

    @Test
    @SneakyThrows
    void GivenOfferExists_WhenIsOfferClaimed_ThenReturnFalse() {
        UUID offerIdLocal = UUID.randomUUID();
        Offer foundOffer = new Offer();

        when(principalService.getSupplierId()).thenReturn(supplierId);
        when(offerRepository.findByIdAndSupplierId(offerIdLocal, supplierId)).thenReturn(Optional.of(foundOffer));
        when(discountCodeRepository.existsByOfferId(offerIdLocal)).thenReturn(false);

        Boolean result = discountCodeService.isDiscountCodeClaimedForOffer(offerIdLocal);

        Assertions.assertFalse(result);
    }

    @Test
    @SneakyThrows
    void GivenPercentageOffer_WhenCalculateDiscountedAmount_ThenCorrectValueReturned() {
        OfferType offerType = new OfferType();
        offerType.setOfferTypeId(0); // percentage

        offer.setOfferType(offerType);
        offer.setAmount(10.0); // 10%

        discountCode.setOffer(offer);

        Method method = DiscountCodeService.class
                .getDeclaredMethod("calculateDiscountedAmount", Double.class, DiscountCode.class);
        method.setAccessible(true);

        double result = (double) method.invoke(discountCodeService, 200.0, discountCode);

        assertEquals(20.0, result);
    }

    @Test
    @SneakyThrows
    void GivenMembershipOffer_WhenValidate_ThenOfferWithoutAmountReturnsFalse() {
        OfferType offerType = new OfferType();
        offerType.setOfferTypeId(3); // MEMBERSHIP

        offer.setOfferType(offerType);
        discountCode.setOffer(offer);

        Method method = DiscountCodeService.class
                .getDeclaredMethod("isOfferWithoutAmount", DiscountCode.class);
        method.setAccessible(true);

        boolean result = (boolean) method.invoke(discountCodeService, discountCode);

        assertFalse(result);
    }

    @Test
    @SneakyThrows
    void WhenDeactivateDiscountCode_ThenIsActiveFalse() {
        discountCode.setIsActive(true);

        Method method = DiscountCodeService.class
                .getDeclaredMethod("deactivateDiscountCode", DiscountCode.class);
        method.setAccessible(true);

        method.invoke(discountCodeService, discountCode);

        assertFalse(discountCode.getIsActive());
    }

    @Test
    @SneakyThrows
    void GivenNoRestriction_WhenValidateOfferEligibility_ThenNoException() {
        offer.setRestriction(null);
        discountCode.setOffer(offer);

        Method method = DiscountCodeService.class
                .getDeclaredMethod("validateOfferEligibility", DiscountCode.class, LocalDateTime.class);
        method.setAccessible(true);

        Assertions.assertDoesNotThrow(() ->
                method.invoke(discountCodeService, discountCode, LocalDateTime.now()));
    }

    @Test
    @SneakyThrows
    void GivenFrequencySetAndNoTransaction_WhenHasFrequencyViolation_ThenFalse() {
        Restriction restriction = new Restriction();
        restriction.setFrequencyOfUse(FrequencyOfUse.DAILY);
        offer.setRestriction(restriction);
        discountCode.setOffer(offer);
        discountCode.setUserId(userId);

        when(offerTransactionService.getLastOfferValidationForCitizen(any(), any()))
                .thenReturn(Optional.empty());

        Method method = DiscountCodeService.class
                .getDeclaredMethod("hasFrequencyViolation", DiscountCode.class);
        method.setAccessible(true);

        boolean result = (boolean) method.invoke(discountCodeService, discountCode);

        assertFalse(result);
    }

    @Test
    @SneakyThrows
    void GivenNonSingleUse_WhenProcessTransaction_ThenDiscountCodeRemainsActive() {
        Restriction restriction = new Restriction();
        restriction.setFrequencyOfUse(FrequencyOfUse.DAILY);
        offer.setRestriction(restriction);
        discountCode.setOffer(offer);

        CitizenBenefit citizenBenefit = CitizenBenefit.builder()
                .userId(userId)
                .benefit(benefit)
                .amount(200.0)
                .build();

        Method method = DiscountCodeService.class
                .getDeclaredMethod("processDiscountCodeTransaction",
                        DiscountCode.class, LocalDateTime.class, Double.class, CitizenBenefit.class);
        method.setAccessible(true);

        method.invoke(discountCodeService, discountCode, LocalDateTime.now(), 20.0, citizenBenefit);

        verify(discountCodeRepository, never()).save(any());
    }

    @Test
    @SneakyThrows
    void GivenNullOfferAmount_WhenGetAmountFromBenefitOffer_ThenZeroReturned() {
        offer.setAmount(null);

        Method method = DiscountCodeService.class
                .getDeclaredMethod("getAmountFromBenefitOffer", Offer.class);
        method.setAccessible(true);

        Double result = (Double) method.invoke(discountCodeService, offer);

        assertEquals(0.0, result);
    }

    @Test
    @SneakyThrows
    void GivenNullRestriction_WhenHasPriceViolation_ThenFalse() {
        Method method = DiscountCodeService.class
                .getDeclaredMethod("hasPriceViolation", Restriction.class, Double.class);
        method.setAccessible(true);

        boolean result = (boolean) method.invoke(discountCodeService, null, 50.0);

        assertFalse(result);
    }

    @Test
    @SneakyThrows
    void GivenNoMinMaxPrice_WhenHasPriceViolation_ThenFalse() {
        Restriction restriction = new Restriction();

        Method method = DiscountCodeService.class
                .getDeclaredMethod("hasPriceViolation", Restriction.class, Double.class);
        method.setAccessible(true);

        boolean result = (boolean) method.invoke(discountCodeService, restriction, 50.0);

        assertFalse(result);
    }

    @Test
    @SneakyThrows
    void GivenNonPercentageOffer_WhenCalculateDiscountedAmount_ThenOriginalReturned() {
        OfferType offerType = new OfferType();
        offerType.setOfferTypeId(1); // not percentage

        offer.setOfferType(offerType);
        offer.setAmount(10.0);
        discountCode.setOffer(offer);

        Method method = DiscountCodeService.class
                .getDeclaredMethod("calculateDiscountedAmount", Double.class, DiscountCode.class);
        method.setAccessible(true);

        double result = (double) method.invoke(discountCodeService, 200.0, discountCode);

        assertEquals(200.0, result);
    }

    @Test
    @SneakyThrows
    void WhenGenerateCode_ThenFiveCharacterAlphaNumericReturned() {
        Method method = DiscountCodeService.class
                .getDeclaredMethod("generateCode");
        method.setAccessible(true);

        String code = (String) method.invoke(discountCodeService);

        assertNotNull(code);
        assertEquals(5, code.length());
    }


    @Test
    void GivenUserId_WhenGetAllByUserId_ThenReturnDiscountCodeList() {
        // Arrange
        List<DiscountCode> expectedCodes = List.of(new DiscountCode(), new DiscountCode());
        when(discountCodeRepository.findAllByUserId(userId)).thenReturn(expectedCodes);

        // Act
        List<DiscountCode> result = discountCodeService.getAllByUserId(userId);

        // Assert
        assertEquals(expectedCodes, result);
    }

    @Test
    void GivenDiscountCodeList_WhenSaveAll_ThenReturnSavedDiscountCodeList() {
        // Arrange
        List<DiscountCode> codesToSave = List.of(new DiscountCode(), new DiscountCode());
        when(discountCodeRepository.saveAll(codesToSave)).thenReturn(codesToSave);

        // Act
        List<DiscountCode> result = discountCodeService.saveAll(codesToSave);

        // Assert
        assertEquals(codesToSave, result);
    }


}

