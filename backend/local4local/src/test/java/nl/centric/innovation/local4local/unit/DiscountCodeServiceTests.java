package nl.centric.innovation.local4local.unit;

import lombok.SneakyThrows;
import nl.centric.innovation.local4local.dto.CodeValidationRequestDto;
import nl.centric.innovation.local4local.dto.CodeValidationResponseDto;
import nl.centric.innovation.local4local.dto.DiscountCodeViewDto;
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
import nl.centric.innovation.local4local.repository.DiscountCodeRepository;
import nl.centric.innovation.local4local.repository.OfferRepository;
import nl.centric.innovation.local4local.repository.OfferTransactionRepository;
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
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DiscountCodeServiceTests {

    @Mock
    private DiscountCodeRepository discountCodeRepository;

    @Mock
    private OfferRepository offerRepository;

    @Mock
    private OfferTransactionRepository offerTransactionRepository;

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

    @BeforeEach
    public void setup() {
        userId = UUID.randomUUID();
        offerId = UUID.randomUUID();
        supplierId = UUID.randomUUID();
        offer = new Offer();
        offer.setId(offerId);

    }

    @Test
    void GivenInvalidDiscountCodeWithAmount_WhenValidateAndProcessDiscountCodeWithAmount_ThenThrowDtoValidateException() {
        // Given
        String invalidCode = "INVALID";
        double amount = 100.0;

        when(principalService.getSupplierId()).thenReturn(supplierId);
        when(discountCodeRepository.findByCodeIgnoreCaseAndIsActiveTrueAndOfferSupplierId(invalidCode, supplierId)).thenReturn(Optional.empty());

        // Then
        assertThrows(DtoValidateException.class, () -> discountCodeService.validateAndProcessDiscountCode(new CodeValidationRequestDto(invalidCode, "12:00:00", amount)));
    }

    @Test
    @SneakyThrows
    void GivenValidDiscountCodeWithAmount_WhenValidateAndProcessDiscountCodeWithAmount_ThenExpectSuccess() {
        // Given
        String validCode = "JV12A";
        double amount = 100.0;
        offer.setId(offerId);
        offer.setStatus(GenericStatusEnum.ACTIVE);
        offer.setActive(true);
        offer.setAmount(20.0);
        OfferType offerType = new OfferType();
        offerType.setOfferTypeId(1);
        offer.setOfferType(offerType);

        DiscountCode discountCode = new DiscountCode();
        discountCode.setCode(validCode);
        discountCode.setIsActive(true);
        discountCode.setOffer(offer);

        when(principalService.getSupplierId()).thenReturn(supplierId);
        when(discountCodeRepository.findByCodeIgnoreCaseAndIsActiveTrueAndOfferSupplierId(validCode, supplierId)).thenReturn(Optional.of(discountCode)).thenReturn(Optional.of(discountCode));
        doNothing().when(offerTransactionService).saveTransaction(any(DiscountCode.class), any(Double.class), any(LocalDateTime.class));

        // When
        CodeValidationResponseDto result = discountCodeService.validateAndProcessDiscountCode(new CodeValidationRequestDto(validCode, "01/27/2025, 17:50:50", amount));

        // Then
        assertNotNull(result);
        assertEquals(validCode, result.code());
        lenient().when(discountCodeRepository.findByCodeIgnoreCaseAndIsActiveTrueAndOfferSupplierId(validCode, supplierId)).thenReturn(Optional.of(discountCode));
        verify(offerTransactionService, times(1)).saveTransaction(any(DiscountCode.class), any(Double.class), any(LocalDateTime.class));
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
        assertThrows(DtoValidateException.class, () -> discountCodeService.validateAndProcessDiscountCode(new CodeValidationRequestDto(validCode, "12:00:00", amount)));
    }

    @Test
    void TestSave_WhenDiscountCodeNotExist() {
        // Arrange
        offer.setId(offerId);
        discountCode.setOffer(offer);
        discountCode.setUserId(userId);

        when(offerRepository.findById(offerId)).thenReturn(Optional.of(offer));
        when(discountCodeRepository.findByUserIdAndOfferId(userId, offerId)).thenReturn(Optional.empty());

        // Act
        discountCodeService.save(offerId, userId);

        // Assert
        verify(discountCodeRepository, times(1)).save(any(DiscountCode.class));
    }

    @Test
    void testSave_WhenDiscountCodeAlreadyExists() {
        // Given
        offer.setId(offerId);
        discountCode.setOffer(offer);
        discountCode.setUserId(userId);

        when(offerRepository.findById(offerId)).thenReturn(Optional.of(offer));
        when(discountCodeRepository.findByUserIdAndOfferId(userId, offerId)).thenReturn(Optional.of(discountCode));

        // When
        discountCodeService.save(offerId, userId);

        // Then
        verify(discountCodeRepository, times(0)).save(any(DiscountCode.class));
    }


    @Test
    void GivenValidRequest_WhenSaveDiscountCode_ThenExpectSuccess() {
        // Arrange
        when(discountCodeRepository.findByUserIdAndOfferId(userId, offerId)).thenReturn(Optional.empty());

        offer.setId(offerId);  // Make sure you set the Offer ID

        // Mock the offerRepository to return the offer
        when(offerRepository.findById(offerId)).thenReturn(Optional.of(offer));

        // Act
        discountCodeService.save(offerId, userId);

        // Assert
        verify(discountCodeRepository, times(1)).save(any(DiscountCode.class));
    }

    @Test
    void GivenExistingDiscountCode_WhenSaveDiscountCode_ThenDoNotSaveAgain() {
        // Given
        DiscountCode existingDiscountCode = new DiscountCode();

        // When
        when(discountCodeRepository.findByUserIdAndOfferId(userId, offerId)).thenReturn(Optional.of(existingDiscountCode));

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
    @SneakyThrows
    void GivenValidDiscountCode_WhenValidateDiscountCode_ThenExpectSuccess() {
        // Given
        String validCode = "JV12A";

        offer.setId(offerId);
        offer.setStatus(GenericStatusEnum.ACTIVE);
        OfferType offerType = new OfferType(0, "test");
        offer.setOfferType(offerType);
        offer.setActive(true);

        DiscountCode discountCode = new DiscountCode();
        discountCode.setCode(validCode);
        discountCode.setIsActive(true);
        discountCode.setOffer(offer);

        when(principalService.getSupplierId()).thenReturn(supplierId);
        when(discountCodeRepository.findByCodeIgnoreCaseAndIsActiveTrueAndOfferSupplierId(validCode, supplierId)).thenReturn(Optional.of(discountCode));

        doNothing().when(offerTransactionService).saveTransaction(any(DiscountCode.class), any(Double.class), any(LocalDateTime.class));

        // When
        CodeValidationResponseDto result = discountCodeService.validateAndProcessDiscountCode(new CodeValidationRequestDto(validCode, "01/27/2025, 17:50:50", null));

        // Then
        assertNotNull(result);
        assertEquals(validCode, result.code());
        verify(discountCodeRepository, times(1)).findByCodeIgnoreCaseAndIsActiveTrueAndOfferSupplierId(validCode, supplierId);
        verify(offerTransactionService, times(1)).saveTransaction(any(DiscountCode.class), any(Double.class), any(LocalDateTime.class));
    }

    @Test
    void GivenInvalidCodeFormat_WhenValidateDiscountCode_ThenThrowDtoValidateException() {
        // Given
        String invalidCode = "12!A";

        // Then
        assertThrows(DtoValidateException.class,
                () -> discountCodeService.validateAndProcessDiscountCode(new CodeValidationRequestDto(invalidCode, "01/27/2025, 17:50:50", null)));
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
        OfferType offerType = new OfferType(0, "test");
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
                discountCodeService.validateAndProcessDiscountCode(new CodeValidationRequestDto(discountCode, currentTime, null))
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
        assertThrows(DtoValidateException.class, () -> discountCodeService.validateAndProcessDiscountCode(new CodeValidationRequestDto(validCode, "01/27/2025, 17:50:50", null)));
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
        OfferType offerType = new OfferType(0, "test");
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
                discountCodeService.validateAndProcessDiscountCode(new CodeValidationRequestDto(discountCode, currentTime, 30.0))
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

}

