package nl.centric.innovation.local4local.unit;

import lombok.SneakyThrows;
import nl.centric.innovation.local4local.dto.DeleteOffersDto;
import nl.centric.innovation.local4local.dto.FilterOfferRequestDto;
import nl.centric.innovation.local4local.dto.OfferMobileDetailDto;
import nl.centric.innovation.local4local.dto.OfferMobileListDto;
import nl.centric.innovation.local4local.dto.OfferMobileMapLightDto;
import nl.centric.innovation.local4local.dto.OfferRejectionReasonDto;
import nl.centric.innovation.local4local.dto.OfferRequestDto;
import nl.centric.innovation.local4local.dto.OfferDto;
import nl.centric.innovation.local4local.dto.OfferStatusCountsDto;
import nl.centric.innovation.local4local.dto.OfferUsageRequestDto;
import nl.centric.innovation.local4local.dto.OfferViewDto;
import nl.centric.innovation.local4local.dto.OfferViewTableDto;
import nl.centric.innovation.local4local.dto.ReactivateOfferDto;
import nl.centric.innovation.local4local.dto.RejectOfferDto;
import nl.centric.innovation.local4local.dto.RestrictionRequestDto;
import nl.centric.innovation.local4local.entity.Category;
import nl.centric.innovation.local4local.entity.Grant;
import nl.centric.innovation.local4local.entity.Offer;
import nl.centric.innovation.local4local.entity.OfferType;
import nl.centric.innovation.local4local.entity.RejectOffer;
import nl.centric.innovation.local4local.entity.Role;
import nl.centric.innovation.local4local.entity.Supplier;
import nl.centric.innovation.local4local.entity.SupplierProfile;
import nl.centric.innovation.local4local.entity.Tenant;
import nl.centric.innovation.local4local.entity.User;
import nl.centric.innovation.local4local.enums.CreatedForEnum;
import nl.centric.innovation.local4local.enums.GenericStatusEnum;
import nl.centric.innovation.local4local.enums.TimeIntervalPeriod;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.repository.DiscountCodeRepository;
import nl.centric.innovation.local4local.repository.OfferRepository;
import nl.centric.innovation.local4local.repository.OfferTypeRepository;
import nl.centric.innovation.local4local.repository.RejectOfferRepository;
import nl.centric.innovation.local4local.service.impl.DiscountCodeService;
import nl.centric.innovation.local4local.service.impl.GrantService;
import nl.centric.innovation.local4local.service.impl.OfferService;
import nl.centric.innovation.local4local.service.impl.PrincipalService;
import nl.centric.innovation.local4local.service.impl.UserService;
import nl.centric.innovation.local4local.service.interfaces.EmailService;
import nl.centric.innovation.local4local.service.interfaces.RestrictionService;
import nl.centric.innovation.local4local.service.interfaces.SupplierService;
import nl.centric.innovation.local4local.service.interfaces.TenantService;
import nl.centric.innovation.local4local.util.DateUtils;
import nl.centric.innovation.local4local.util.ModelConverter;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Stream;

import static nl.centric.innovation.local4local.service.impl.GrantService.ORDER_CRITERIA;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OfferServiceImplTests {

    @InjectMocks
    private OfferService offerService;

    @Mock
    private OfferRepository offerRepository;

    @Mock
    private OfferTypeRepository offerTypeRepository;

    @Mock
    private DiscountCodeRepository discountCodeRepository;

    @Mock
    private RejectOfferRepository rejectOfferRepository;

    @Mock
    private GrantService grantService;

    @Mock
    private PrincipalService principalService;

    @Mock
    private SupplierService supplierService;

    @Mock
    private RestrictionService restrictionService;

    @Mock
    private UserService userServiceMock;

    @Mock
    private EmailService emailService;

    @Mock
    private TenantService tenantService;

    @Mock
    private DiscountCodeService discountCodeService;

    private static final UUID SUPPLIER_ID = UUID.randomUUID();
    private static final UUID OFFER_ID = UUID.randomUUID();
    private static final Double LATITUDE = 52.364246;
    private static final Double LONGITUDE = 4.942446;

    private static final Double MIN_LATITUDE = 0.0;
    private static final Double MAX_LATITUDE = 1.0;
    private static final Double MIN_LONGITUDE = 0.0;
    private static final Double MAX_LONGITUDE = 1.0;

    private static Stream<Arguments> customAvailability() {
        return Stream.of(Arguments.of(LocalDate.now(), LocalDate.now()),
                Arguments.of(LocalDate.of(2023, 12, 10), LocalDate.of(2023, 10, 11)));
    }

    @Test
    @SneakyThrows
    void GivenValidRequest_WhenCreateOffer_ThenExpectSuccess() {
        // Given
        String coordinatesString = "test";
        RestrictionRequestDto restrictionRequestDto = RestrictionRequestDto.builder().ageRestriction(10).build();
        OfferRequestDto offerRequestDto = offerRequestDtoBuilder(LocalDate.of(2023, 10, 2), LocalDate.of(2023, 12, 11),
                getIds());

        User user = new User();
        user.setRole(new Role(1, "ROLE_SUPPLIER"));

        Tenant tenant = Tenant.builder().name("TestTenant").build();
        Authentication authentication = new UsernamePasswordAuthenticationToken(user, null);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // When
        when(offerRepository.save(any(Offer.class))).thenAnswer(invocation -> {
            Offer offer = invocation.getArgument(0);
            if (offer.getId() == null) {
                offer.setId(UUID.randomUUID());
            }
            return offer;
        });

        OfferType offerTypeMock = offerTypeBuilder();
        Set<Grant> mockGrantsList = Set.of(grantBuilder(), grantBuilder());
        UUID supplierId = UUID.randomUUID();
        Supplier supplier = Supplier.builder()
                .companyName("CompanyName")
                .build();
        SupplierProfile supplierProfile = SupplierProfile.builder()
                .coordinatesString(coordinatesString)
                .coordinates(null)
                .build();
        supplier.setProfile(supplierProfile);
        user.setSupplier(supplier);
        when(offerTypeRepository.findById(offerRequestDto.offerTypeId())).thenReturn(Optional.of(offerTypeMock));
        when(grantService.getAllInIds(offerRequestDto.grantsIds())).thenReturn(mockGrantsList);
        when(principalService.getTenantId()).thenReturn(UUID.randomUUID());
        when(principalService.getSupplierId()).thenReturn(supplierId);
        when(supplierService.findBySupplierId(supplierId)).thenReturn(Optional.of(supplier));
        when(tenantService.findByTenantId(any(UUID.class))).thenReturn(Optional.of(tenant));
        when(principalService.getUser()).thenReturn(user);
        when(restrictionService.saveRestriction(restrictionRequestDto))
                .thenReturn(ModelConverter.restrictionRequestDtoToEntity(restrictionRequestDto));

        offerTypeRepository.findById(offerRequestDto.offerTypeId());

        OfferViewDto result = offerService.createOffer(offerRequestDto, "en-US");

        // Then
        verify(offerRepository).save(any(Offer.class));

        assertNotNull(result);
    }


    @Test
    @SneakyThrows
    void GivenNullOfferType_WhenCreateOffer_ThenExpectError() {
        OfferRequestDto offerRequestDto = offerRequestDtoBuilder(LocalDate.of(2023, 10, 2), LocalDate.of(2023, 12, 11),
                getIds());

        when(offerTypeRepository.findById(offerRequestDto.offerTypeId())).thenReturn(Optional.empty());

        assertThrows(DtoValidateException.class, () -> offerService.createOffer(offerRequestDto, "en-US"));
    }

    @Test
    @SneakyThrows
    void GivenWrongSupplierInContext_WhenCreateOffer_ThenExpectError() {
        OfferRequestDto offerRequestDto = offerRequestDtoBuilder(LocalDate.of(2023, 10, 2), LocalDate.of(2023, 12, 11),
                getIds());

        OfferType offerTypeMock = offerTypeBuilder();
        UUID supplierId = UUID.randomUUID();
        when(offerTypeRepository.findById(offerRequestDto.offerTypeId())).thenReturn(Optional.of(offerTypeMock));
        when(principalService.getSupplierId()).thenReturn(supplierId);
        when(supplierService.findBySupplierId(supplierId)).thenReturn(Optional.empty());

        assertThrows(DtoValidateException.class, () -> offerService.createOffer(offerRequestDto, "en-US"));
    }

    @Test
    @SneakyThrows
    void GivenNullIds_WhenCreateOffer_ThenExpectError() {
        OfferRequestDto offerRequestDto = offerRequestDtoBuilder(LocalDate.of(2023, 10, 2), LocalDate.of(2023, 12, 11),
                null);

        when(offerTypeRepository.findById(offerRequestDto.offerTypeId())).thenReturn(Optional.empty());

        assertThrows(DtoValidateException.class, () -> offerService.createOffer(offerRequestDto, "en-US"));
    }

    @Test
    @SneakyThrows
    void GivenNullIds_WhenCreateOfferWithGrant_ThenExpectError() {
        OfferRequestDto offerRequestDto = offerRequestDtoBuilder(LocalDate.of(2023, 10, 2), LocalDate.of(2023, 12, 11),
                null);

        OfferType offerTypeMock = OfferType.builder().offerTypeId(0).offerTypeLabel("test").build();

        when(offerTypeRepository.findById(offerRequestDto.offerTypeId())).thenReturn(Optional.of(offerTypeMock));

        assertThrows(DtoValidateException.class, () -> offerService.createOffer(offerRequestDto, "en-US"));
    }

    @ParameterizedTest
    @MethodSource("customAvailability")
    void GivenInvalidAvailability_WhenCreateOffer_ThenExpectDtoValidateException(LocalDate starDate,
                                                                                 LocalDate expirationDate) {

        // Given
        OfferRequestDto requestDto = offerRequestDtoBuilder(starDate, expirationDate,
                getIds());

        // When
        assertThrows(DtoValidateException.class, () -> offerService.createOffer(requestDto, "en-US"));

        // Then
        verify(offerRepository, never()).save(any(Offer.class));
    }

    @Test
    void GivenValid_WhenGetAll_ThenListOfOfferViewDtoReturned() {
        // Given
        List<Offer> mockOfferList = List.of(offerBuilder(), offerBuilder());
        Page<Offer> mockOfferPage = new PageImpl<>(mockOfferList);
        Pageable pageable = PageRequest.of(0, 25, Sort.by(ORDER_CRITERIA));
        UUID supplierId = UUID.randomUUID();

        // When
        when(principalService.getSupplierId()).thenReturn(supplierId);
        when(offerRepository.findAllBySupplierIdAndIsActive(supplierId, true, pageable)).thenReturn(mockOfferPage);

        List<OfferViewTableDto> offerViewDtos = offerService.getAll(0, 25);

        // Then
        assertNotNull(offerViewDtos);
        assertEquals(mockOfferList.size(), offerViewDtos.size());
    }

    @Test
    void GivenValid_WhenCount_ThenShouldCount() {

        // Given
        UUID supplierId = UUID.randomUUID();

        // When
        when(principalService.getSupplierId()).thenReturn(supplierId);
        when(offerRepository.countBySupplierIdAndIsActiveTrue(supplierId)).thenReturn(2);

        Integer count = offerService.countAll();

        assertEquals(2, count);
    }

    @Test
    void GivenValid_WhenCountForTenant_ThenShouldCount() {

        // Given
        UUID tenantId = UUID.randomUUID();
        List<GenericStatusEnum> statusList = Arrays.asList(GenericStatusEnum.PENDING, GenericStatusEnum.REJECTED);

        // When
        when(principalService.getTenantId()).thenReturn(tenantId);
        when(offerRepository.countBySupplierTenantIdAndIsActiveTrueAndStatusIn(tenantId, statusList)).thenReturn(2);

        Integer count = offerService.countAllForTenantId();

        assertEquals(2, count);
    }

    @Test
    void GivenValid_WhenGetAllForTenant_ThenListOfOfferViewDtoReturned() {
        // Given
        List<Offer> mockOfferList = List.of(offerBuilder(), offerBuilder());
        Page<Offer> mockOfferPage = new PageImpl<>(mockOfferList);
        Pageable pageable = PageRequest.of(0, 25, Sort.by(ORDER_CRITERIA));
        UUID tenantId = UUID.randomUUID();
        List<GenericStatusEnum> statusList = Arrays.asList(GenericStatusEnum.PENDING, GenericStatusEnum.REJECTED);

        // When
        when(principalService.getTenantId()).thenReturn(tenantId);
        when(offerRepository.findAllBySupplierTenantIdAndIsActiveTrueAndStatusIn(tenantId, pageable, statusList))
                .thenReturn(mockOfferPage);

        List<OfferViewTableDto> offerViewDtos = offerService.getAllForTenantPaginated(0, 25);

        // Then
        assertNotNull(offerViewDtos);
        assertEquals(mockOfferList.size(), offerViewDtos.size());
    }

    @Test
    @SneakyThrows
    void GivenValidOffer_WhenMunicipalityApproves_ThenTheOfferShouldBeActive() {
        // Given
        String language = "en";

        String[] emails = {"email@domain.com"};
        Tenant mockedTenand = Tenant.builder().name("TestTenant").build();

        Supplier mockedSupplier = Supplier.builder().tenant(mockedTenand).build();
        mockedSupplier.setId(SUPPLIER_ID);
        Offer offerMock = Offer.builder().status(GenericStatusEnum.PENDING).supplier(mockedSupplier).build();

        when(supplierService.findBySupplierId(SUPPLIER_ID)).thenReturn(Optional.of(mockedSupplier));
        when(offerRepository.findById(OFFER_ID)).thenReturn(Optional.of(offerMock));
        when(userServiceMock.getEmailsBySupplierId(SUPPLIER_ID)).thenReturn(emails);

        // When
        offerService.approveOffer(OFFER_ID, language);

        // Then
        verify(offerRepository, times(1)).save(offerMock);
        verify(emailService, times(1)).sendApproveOfferEmail(any(), eq(emails), eq(language), any(), any());
    }

    @Test
    void GivenValidProperties_WhenCallingUpdateOfferStatus_ThenTheOfferShouldBeUpdated() {
        // Given
        Offer offer = Offer.builder().status(GenericStatusEnum.PENDING).build();
        GenericStatusEnum status = GenericStatusEnum.ACTIVE;

        // When
        offerService.updateOfferStatus(offer, status);

        // Then
        assertEquals(GenericStatusEnum.ACTIVE, offer.getStatus());
        verify(offerRepository, times(1)).save(offer);
    }

    @Test
    @SneakyThrows
    void GivenValidData_WhenSendReviewOfferEmail_ThenExpectEmailServiceToBeCalled() {

        // Given
        UUID tenantId = UUID.randomUUID();
        String language = "en";

        User user = new User();
        user.setRole(new Role(1, "ROLE_SUPPLIER"));
        user.setUsername("username");
        user.setSupplier(Supplier.builder().companyName("companyName").build());

        Tenant mockedTenant = new Tenant();

        List<User> adminList = Arrays.asList(User.builder().username("username1").build(),
                User.builder().username("username2").build());

        // When
        when(tenantService.findByTenantId(tenantId)).thenReturn(Optional.of(mockedTenant));

        when(userServiceMock.findAllAdminsByTenantId(tenantId)).thenReturn(adminList);

        doNothing().when(emailService).sendOfferReviewEmail(any(), any(), any(), any(), any(), any());

        offerService.sendReviewOfferEmail(tenantId, language, user);

        // Then
        verify(tenantService, times(1)).findByTenantId(tenantId);
        verify(userServiceMock, times(1)).findAllAdminsByTenantId(tenantId);
        verify(emailService, times(1)).sendOfferReviewEmail(any(), any(), any(), any(), any(), any());
    }

    @Test
    void GivenNotExistingTenant_WhenSendReviewOfferEmail_ThenExpectDtoValidateNotFoundException() {

        // Given
        UUID nonExistentTenantId = UUID.randomUUID();
        String language = "en";
        User user = new User();

        when(tenantService.findByTenantId(nonExistentTenantId)).thenReturn(Optional.empty());

        // Then
        assertThrows(DtoValidateNotFoundException.class, () -> offerService
                .sendReviewOfferEmail(nonExistentTenantId, language, user));

        verify(tenantService, times(1)).findByTenantId(nonExistentTenantId);
        verify(userServiceMock, never()).findAllAdminsByTenantId(any());
        verify(emailService, never()).sendProfileCreatedEmail(any(), any(), any(), any(), any(), any());
    }

    @Test
    @SneakyThrows
    void GivenValidDataButNoOffers_WhenGetOffersOrderedByDistanceToUser_ThenExpectEmptyList() {
        // Given
        int page = 0;
        Pageable pageable = PageRequest.of(page, 20);
        UUID tenantId = UUID.randomUUID();
        LocalDate localDate = LocalDate.of(2025, 3, 4);

        when(principalService.getTenantId()).thenReturn(tenantId);
        when(offerRepository.findAllOffersOrderedByDistanceToUser(pageable, LATITUDE, LONGITUDE, tenantId, localDate)).thenReturn(Collections.emptyList());
        // When
        List<OfferMobileListDto> result = offerService.getOffersOrderedByDistanceToUser(page, LATITUDE, LONGITUDE, localDate);

        // Then
        assertTrue(result.isEmpty());
    }

    @Test
    @SneakyThrows
    void GivenValidDataButOneOffer_WhenGetOffersOrderedByDistanceToUser_ThenExpectOneOffer() {
        // Given
        int page = 0;
        Pageable pageable = PageRequest.of(page, 20);
        UUID tenantId = UUID.randomUUID();
        LocalDate localDate = LocalDate.of(2025, 3, 4);

        when(principalService.getTenantId()).thenReturn(tenantId);
        when(offerRepository.findAllOffersOrderedByDistanceToUser(pageable, LATITUDE, LONGITUDE, tenantId, localDate)).thenReturn(List.of(offerMobileListDtotoBuilder()));
        // When
        List<OfferMobileListDto> result = offerService.getOffersOrderedByDistanceToUser(page, LATITUDE, LONGITUDE, localDate);

        // Then
        assertEquals(1, result.size());
    }

    @Test
    void GivenNaNLatitude_WhenGetOffersOrderedByDistanceToUser_ThenExpectDtoValidateException() {
        // Given
        Integer page = 0;
        Double latitude = Double.NaN;
        Double longitude = -74.0;

        // When Then
        assertThrows(DtoValidateException.class, () -> offerService.getOffersOrderedByDistanceToUser(page, latitude, longitude, LocalDate.of(2030, 4, 3)));
    }

    @Test
    void GivenNonExistingOfferId_WhenGetOfferDetails_ThenExpectDtoToValidateNotFoundException() {

        when(offerRepository.findById(OFFER_ID)).thenReturn(Optional.empty());
        assertThrows(DtoValidateNotFoundException.class, () -> offerService.getOfferDetails(OFFER_ID, LATITUDE, LONGITUDE, LocalDate.now()));
    }

    @Test
    @SneakyThrows
    void GivenValidOfferId_WhenGetOfferDetails_ThenExpectSuccess() {
        UUID citizenId = UUID.randomUUID();
        UUID offerId = UUID.randomUUID();

        Offer offer = offerBuilder();
        offer.setId(offerId);
        User mockUser = new User();
        mockUser.setId(citizenId);

        Category category = Category.builder().categoryLabel("testLabel").build();
        SupplierProfile supplierProfile = SupplierProfile.builder()
                .category(category).companyBranchAddress("address").build();
        Supplier supplier = Supplier.builder()
                .profile(supplierProfile)
                .companyName("companyName")
                .workingHours(List.of())
                .build();
        offer.setSupplier(supplier);

        when(principalService.getUser()).thenReturn(mockUser);
        when(offerRepository.findById(offer.getId())).thenReturn(Optional.of(offer));

        OfferMobileDetailDto offerDetailsViewDto = offerService.getOfferDetails(offer.getId(), LATITUDE, LONGITUDE, LocalDate.of(2024, 12, 10));

        assertEquals(offer.getDescription(), offerDetailsViewDto.description());
    }

    @Test
    @SneakyThrows
    void GivenInvalidOfferId_WhenUseOffer_ThenExpectError() {
        User user = new User();

        when(principalService.getUser()).thenReturn(user);

        OfferUsageRequestDto offerUsageRequestDto = offerTransactionDtoBuilder(UUID.randomUUID());

        when(offerRepository.findByIdAndStatus(offerUsageRequestDto.offerId(), GenericStatusEnum.ACTIVE)).thenReturn(Optional.empty());

        assertThrows(DtoValidateException.class, () -> offerService.useOffer(offerUsageRequestDto));
    }

    @Test
    @SneakyThrows
    void GivenValidOfferIdAndAmount_WhenUseOffer_ThenNoError() {
        // Given
        User user = new User();
        UUID userId = UUID.randomUUID();
        user.setId(userId);
        UUID offerId = UUID.randomUUID();
        when(principalService.getUser()).thenReturn(user);

        Offer offer = new Offer();
        offer.setAmount(10.0);
        offer.setStartDate(LocalDate.now().minusDays(1));
        offer.setExpirationDate(LocalDate.now().plusDays(1));
        offer.setId(offerId);

        OfferUsageRequestDto offerUsageRequestDto = OfferUsageRequestDto.builder()
                .offerId(UUID.randomUUID())
                .amount(5.0)
                .currentTime("20:00:00")
                .build();

        // When
        when(offerRepository.findByIdAndStatus(offerUsageRequestDto.offerId(), GenericStatusEnum.ACTIVE)).thenReturn(Optional.of(offer));
        doNothing().when(discountCodeService).save(offerId, userId);

        assertDoesNotThrow(() -> offerService.useOffer(offerUsageRequestDto));
    }

    @Test
    @SneakyThrows
    void GivenAmountExceedsOfferAmount_WhenUseOffer_ThenExpectError() {
        User user = new User();
        UUID userId = UUID.randomUUID();
        user.setId(userId);

        when(principalService.getUser()).thenReturn(user);

        Offer offer = new Offer();
        offer.setAmount(10.0);

        offer.setStartDate(LocalDate.now().minusDays(1));
        offer.setExpirationDate(LocalDate.now().plusDays(1));

        OfferUsageRequestDto offerUsageRequestDto = OfferUsageRequestDto.builder()
                .offerId(UUID.randomUUID())
                .amount(15.0)
                .currentTime("20:00:00")
                .build();

        when(offerRepository.findByIdAndStatus(offerUsageRequestDto.offerId(), GenericStatusEnum.ACTIVE)).thenReturn(Optional.of(offer));

        assertThrows(DtoValidateException.class, () -> offerService.useOffer(offerUsageRequestDto), "Amount requested exceeds available offer amount.");
    }

    @Test
    void givenValidRequest_whenCountFilteredOffers_thenReturnCount() {
        // Given
        FilterOfferRequestDto filterParams = FilterOfferRequestDto.builder()
                .status(GenericStatusEnum.ACTIVE)
                .offerTypeId(1)
                .grantId(UUID.randomUUID())
                .build();

        int expectedCount = 10;

        // When
        when(principalService.getSupplierId()).thenReturn(SUPPLIER_ID);
        when(offerRepository.countWithSpecification(SUPPLIER_ID, filterParams)).thenReturn(expectedCount);

        Integer result = offerService.countFilteredOffers(filterParams);

        // Then
        assertNotNull(result);
        assertEquals(expectedCount, result);
        verify(principalService).getSupplierId();
        verify(offerRepository).countWithSpecification(SUPPLIER_ID, filterParams);
    }

    @Test
    @SneakyThrows
    void GivenDateOutOfRange_WhenUseOffer_ThenExpectError() {
        User user = new User();
        UUID userId = UUID.randomUUID();
        user.setId(userId);

        when(principalService.getUser()).thenReturn(user);

        Offer offer = new Offer();
        offer.setAmount(10.0);


        offer.setStartDate(LocalDate.now().plusDays(1));
        offer.setExpirationDate(LocalDate.now().minusDays(1));

        OfferUsageRequestDto offerUsageRequestDto = OfferUsageRequestDto.builder()
                .offerId(UUID.randomUUID())
                .amount(5.0)
                .currentTime("20:00:00")
                .build();

        when(offerRepository.findByIdAndStatus(offerUsageRequestDto.offerId(), GenericStatusEnum.ACTIVE)).thenReturn(Optional.of(offer));

        assertThrows(DtoValidateException.class, () -> offerService.useOffer(offerUsageRequestDto), "Current date is outside the valid range of the offer's start and expiration date.");
    }

    @Test
    void GivenValidSupplierId_WhenCountBySupplier_ThenShouldCount() {

        // Given
        UUID supplierId = UUID.randomUUID();
        // When
        when(offerRepository.countBySupplierIdAndIsActiveTrue(supplierId)).thenReturn(2);

        Integer count = offerService.countAllBySupplierId(supplierId);

        assertEquals(2, count);
    }

    @Test
    void GivenValidSupplierId_WhenGetAllBySupplier_ThenListOfOfferViewDtoReturned() {
        // Given
        List<Offer> mockOfferList = List.of(offerBuilder(), offerBuilder());
        Page<Offer> mockOfferPage = new PageImpl<>(mockOfferList);
        Pageable pageable = PageRequest.of(0, 25, Sort.by(ORDER_CRITERIA));
        UUID supplierId = UUID.randomUUID();

        // When
        when(offerRepository.findAllBySupplierIdAndIsActive(supplierId, true, pageable))
                .thenReturn(mockOfferPage);

        List<OfferViewTableDto> offerViewDtos = offerService.getAllBySupplierIdPaginated(0, 25, supplierId);

        // Then
        assertNotNull(offerViewDtos);
        assertEquals(mockOfferList.size(), offerViewDtos.size());
    }

    @Test
    void GivenOffersIds_WhenDeleteOffers_ThenShouldDelete() {
        // Given
        List<UUID> offerIds = Arrays.asList(UUID.randomUUID(), UUID.randomUUID());

        Offer offer1 = new Offer();
        offer1.setId(offerIds.get(0));
        Offer offer2 = new Offer();
        offer1.setId(offerIds.get(1));

        List<Offer> offers = Arrays.asList(offer1, offer2);

        DeleteOffersDto deleteOffersDto = DeleteOffersDto.builder().offersIds(offerIds).build();

        when(offerRepository.findAllById(offerIds)).thenReturn(offers);

        // When
        offerService.deleteOffers(deleteOffersDto);

        // Then
        verify(offerRepository, times(1)).findAllById(offerIds);
        verify(offerRepository, times(1)).saveAll(offers);
    }

    @Test
    void GivenValidData_WhenReactivateOffer_ThenShouldReactivate() throws DtoValidateNotFoundException {
        // Given
        UUID offerId = UUID.randomUUID();
        Offer offer = new Offer();
        offer.setId(offerId);
        offer.setOfferType(new OfferType(1, "Percentage"));

        when(offerRepository.findById(offerId)).thenReturn(Optional.of(offer));

        // When
        offerService.reactivateOffer(
                new ReactivateOfferDto(
                        offerId,
                        LocalDate.of(2025, 5, 29),
                        LocalDate.of(2030, 2, 12)));

        // Then
        verify(offerRepository, times(1)).findById(offerId);
        verify(offerRepository, times(1)).save(offer);
    }

    @Test
    void GivenInvalidValidityPeriod_WhenReactivateOffer_ThenExpectError() {
        UUID offerId = UUID.randomUUID();

        assertThrows(DtoValidateException.class, () -> offerService.reactivateOffer(
                new ReactivateOfferDto(
                        offerId,
                        LocalDate.of(2030, 5, 29),
                        LocalDate.of(2025, 2, 12))));
    }

    @Test
    void GivenInvalidOfferId_WhenReactivateOffer_ThenExpectError() {
        UUID offerId = UUID.randomUUID();

        when(offerRepository.findById(offerId)).thenReturn(Optional.empty());

        assertThrows(DtoValidateException.class, () -> offerService.reactivateOffer(
                new ReactivateOfferDto(
                        offerId,
                        LocalDate.of(2025, 5, 29),
                        LocalDate.of(2030, 2, 12))));
    }

    @Test
    void GivenEmptyOffers_WhenGetFilteredOffers_ThenExpectEmptyList() {
        // Given
        UUID supplierId = UUID.randomUUID();
        FilterOfferRequestDto filterParams = FilterOfferRequestDto.builder().build();
        int pageIndex = 0;
        int pageSize = 10;
        Pageable pageable = PageRequest.of(pageIndex, pageSize);

        when(principalService.getSupplierId()).thenReturn(supplierId);
        when(offerRepository.findAllWithSpecification(supplierId, filterParams, pageable)).thenReturn(List.of());

        // When
        List<OfferViewTableDto> result = offerService.getFilteredOffers(filterParams, pageIndex, pageSize);

        // Then
        assertEquals(List.of(), result);
        verify(principalService, times(1)).getSupplierId();
        verify(offerRepository, times(1)).findAllWithSpecification(supplierId, filterParams, pageable);
    }

    @Test
    void GivenValidRequest_WhenGetFilteredOffers_ThenExpectSuccess() {
        // Given
        UUID supplierId = UUID.randomUUID();
        FilterOfferRequestDto filterParams = FilterOfferRequestDto.builder()
                .status(GenericStatusEnum.ACTIVE)
                .offerTypeId(1)
                .grantId(UUID.randomUUID())
                .build();
        int pageIndex = 0;
        int pageSize = 10;
        Pageable pageable = PageRequest.of(pageIndex, pageSize);

        Supplier supplier = new Supplier();
        supplier.setId(supplierId);
        supplier.setCompanyName("Test Company");

        OfferType offerType = new OfferType();
        offerType.setOfferTypeId(1);
        offerType.setOfferTypeLabel("Test Offer Type");

        Offer offer = new Offer();
        offer.setId(UUID.randomUUID());
        offer.setSupplier(supplier);
        offer.setOfferType(offerType);
        offer.setStartDate(LocalDate.now());
        offer.setExpirationDate(LocalDate.now().plusDays(7));
        List<Offer> offers = List.of(offer);

        when(principalService.getSupplierId()).thenReturn(supplierId);
        when(offerRepository.findAllWithSpecification(supplierId, filterParams, pageable)).thenReturn(offers);
        List<OfferViewTableDto> expectedOfferViewTableDtos = offers.stream()
                .map(offerEntity -> ModelConverter.entityToOfferViewTableDto(offerEntity, null))
                .toList();

        // When
        List<OfferViewTableDto> result = offerService.getFilteredOffers(filterParams, pageIndex, pageSize);

        // Then
        assertEquals(expectedOfferViewTableDtos, result);
        verify(principalService, times(1)).getSupplierId();
        verify(offerRepository, times(1)).findAllWithSpecification(supplierId, filterParams, pageable);
    }

    @Test
    @SneakyThrows
    void GivenValidOfferId_WhenGetFullOffer_ThenExpectOffer() {
        // Given
        Offer offer = offerBuilder();
        UUID offerId = offer.getId();
        offer.setStatus(GenericStatusEnum.EXPIRED);

        when(offerRepository.findById(offerId)).thenReturn(Optional.of(offer));

        // When
        OfferDto offerDto = offerService.getFullOffer(offerId);

        // Then
        assertEquals(offer.getDescription(), offerDto.description());
    }

    @Test
    void GivenInvalidOfferId_WhenGetFullOffer_ThenExpectError() {
        UUID offerId = UUID.randomUUID();

        when(offerRepository.findById(offerId)).thenReturn(Optional.empty());

        assertThrows(DtoValidateException.class, () -> offerService.getFullOffer(offerId));
    }

    @Test
    void GivenOffersWithinViewport_WhenGetOffersWithinViewport_ThenSuccess() {
        // Given
        List<OfferMobileMapLightDto> mockOffers = Arrays.asList(
                createOfferMapLightDto("test1", true, "coordinates1"),
                createOfferMapLightDto("test2", false, "coordinates2")
        );
        LocalDate localDate = LocalDate.of(2025, 3, 10);
        UUID tenantId = UUID.randomUUID();

        when(principalService.getTenantId()).thenReturn(tenantId);
        when(offerRepository.findActiveOffersInViewport(MIN_LATITUDE, MAX_LATITUDE, MIN_LONGITUDE, MAX_LONGITUDE, localDate, tenantId, 1))
                .thenReturn(mockOffers);

        // When
        Map<String, List<OfferMobileMapLightDto>> result = offerService.getOffersWithinViewport(MIN_LATITUDE, MAX_LATITUDE, MIN_LONGITUDE, MAX_LONGITUDE, localDate, 1);

        // Then
        assertEquals(mockOffers.size(), result.size());
        verify(offerRepository).findActiveOffersInViewport(MIN_LATITUDE, MAX_LATITUDE, MIN_LONGITUDE, MAX_LONGITUDE, localDate, tenantId, 1);
    }

    @Test
    void GivenNoOffersWithinViewport_WhenGetOffersWithinViewport_ThenEmptyList() {
        // Given
        LocalDate localDate = LocalDate.of(2025, 3, 10);
        UUID tenantId = UUID.randomUUID();

        when(principalService.getTenantId()).thenReturn(tenantId);
        when(offerRepository.findActiveOffersInViewport(MIN_LATITUDE, MAX_LATITUDE, MIN_LONGITUDE, MAX_LONGITUDE, localDate, tenantId, 2))
                .thenReturn(Collections.emptyList());

        // When
        Map<String, List<OfferMobileMapLightDto>> result = offerService.getOffersWithinViewport(MIN_LATITUDE, MAX_LATITUDE, MIN_LONGITUDE, MAX_LONGITUDE, localDate, 2);

        // Then
        assertTrue(result.isEmpty());
        verify(offerRepository).findActiveOffersInViewport(MIN_LATITUDE, MAX_LATITUDE, MIN_LONGITUDE, MAX_LONGITUDE, localDate, tenantId, 2);
    }

    @Test
    void GivenBoundaryCondition_WhenGetOffersWithinViewport_ThenSuccess() {
        // Given
        List<OfferMobileMapLightDto> mockOffers = Arrays.asList(
                createOfferMapLightDto("test1", false, "coordinates1"),
                createOfferMapLightDto("test2", false, "coordinates1")
        );
        LocalDate localDate = LocalDate.of(2025, 3, 4);
        UUID tenantId = UUID.randomUUID();

        when(principalService.getTenantId()).thenReturn(tenantId);
        when(offerRepository.findActiveOffersInViewport(MIN_LATITUDE, MAX_LATITUDE, MIN_LONGITUDE, MAX_LONGITUDE, localDate, tenantId, 1))
                .thenReturn(mockOffers);

        // When
        Map<String, List<OfferMobileMapLightDto>> result = offerService.getOffersWithinViewport(MIN_LATITUDE, MAX_LATITUDE, MIN_LONGITUDE, MAX_LONGITUDE, localDate, 1);

        // Then
        assertEquals(mockOffers.size() - 1, result.size());
        verify(offerRepository).findActiveOffersInViewport(MIN_LATITUDE, MAX_LATITUDE, MIN_LONGITUDE, MAX_LONGITUDE, localDate, tenantId, 1);
    }

    @Test
    void GivenInvalidOfferId_WhenRejectOffer_ThenExpectDtoValidateException() {
        when(offerRepository.findById(OFFER_ID)).thenReturn(Optional.empty());

        RejectOfferDto rejectedOffer = new RejectOfferDto("reason", OFFER_ID);

        assertThrows(DtoValidateException.class, () -> offerService.rejectOffer(rejectedOffer, "en"));
    }

    @Test
    void GivenOfferIdOfNonPendingOffer_WhenRejectOffer_ThenExpectDtoValidateException() {
        Offer offer = createOffer();
        offer.setStatus(GenericStatusEnum.REJECTED);
        RejectOfferDto rejectedOffer = new RejectOfferDto("reason", OFFER_ID);

        when(offerRepository.findById(OFFER_ID)).thenReturn(Optional.of(offer));

        assertThrows(DtoValidateException.class, () -> offerService.rejectOffer(rejectedOffer, "en"));
    }

    @Test
    void GivenValidRejectOfferDto_WhenRejectOffer_ThenExpectSuccess() throws DtoValidateException {
        // Given
        String language = "en";
        Offer offer = createOffer();
        offer.setStatus(GenericStatusEnum.PENDING);
        RejectOfferDto rejectedOffer = new RejectOfferDto("reason", OFFER_ID);

        Tenant mockedTenant = new Tenant();
        Supplier mockedSupplier = Supplier.builder().tenant(mockedTenant).build();
        mockedSupplier.setId(SUPPLIER_ID);
        offer.setSupplier(mockedSupplier);

        when(offerRepository.findById(OFFER_ID)).thenReturn(Optional.of(offer));
        when(supplierService.findBySupplierId(SUPPLIER_ID)).thenReturn(Optional.of(mockedSupplier));

        String[] emails = {"email@domain.com"};
        when(userServiceMock.getEmailsBySupplierId(SUPPLIER_ID)).thenReturn(emails);

        // When
        offerService.rejectOffer(rejectedOffer, language);

        // Then
        verify(rejectOfferRepository, times(1)).save(RejectOffer.rejectOfferDtoToEntity(rejectedOffer));
        verify(emailService, times(1)).sendOfferRejectedEmail(any(), eq(emails), eq(language), eq(rejectedOffer.reason()), any());
    }

    @Test
    void GivenInvalidOfferId_WhenGetOfferRejectionReason_ThenExpectDtoValidateException() {
        when(offerRepository.findById(OFFER_ID)).thenReturn(Optional.empty());

        assertThrows(DtoValidateException.class, () -> offerService.getOfferRejectionReason(OFFER_ID));
    }

    @Test
    void GivenOfferIdOfNonRejectedOffer_WhenGetOfferRejectionReason_ThenExpectDtoValidateException() {
        Offer offer = createOffer();
        offer.setStatus(GenericStatusEnum.PENDING);
        offer.setActive(true);
        offer.setId(OFFER_ID);

        Tenant mockedTenant = new Tenant();
        Supplier mockedSupplier = Supplier.builder().tenant(mockedTenant).build();
        mockedSupplier.setId(SUPPLIER_ID);
        offer.setSupplier(mockedSupplier);

        when(offerRepository.findById(offer.getId())).thenReturn(Optional.of(offer));

        assertThrows(DtoValidateException.class, () -> offerService.getOfferRejectionReason(offer.getId()));
    }

    @Test
    void GivenIdOfOfferWithoutRejection_WhenGetOfferRejectionReason_ThenExpectDtoValidateException() {
        Offer offer = createOffer();
        offer.setStatus(GenericStatusEnum.REJECTED);
        offer.setActive(true);
        offer.setId(OFFER_ID);

        Tenant mockedTenant = new Tenant();
        Supplier mockedSupplier = Supplier.builder().tenant(mockedTenant).build();
        mockedSupplier.setId(SUPPLIER_ID);
        offer.setSupplier(mockedSupplier);

        when(offerRepository.findById(offer.getId())).thenReturn(Optional.of(offer));
        when(principalService.getSupplierId()).thenReturn(mockedSupplier.getId());
        when(rejectOfferRepository.findByOfferId(offer.getId())).thenReturn(Optional.empty());

        assertThrows(DtoValidateException.class, () -> offerService.getOfferRejectionReason(offer.getId()));
    }

    @Test
    void GivenValidOfferIdOfRejectedOffer_WhenGetOfferRejectionReason_ThenExpectSuccess() throws DtoValidateException {
        // Given
        Offer offer = createOffer();
        offer.setStatus(GenericStatusEnum.REJECTED);
        offer.setActive(true);
        offer.setId(OFFER_ID);

        Tenant mockedTenant = new Tenant();
        Supplier mockedSupplier = Supplier.builder().tenant(mockedTenant).build();
        mockedSupplier.setId(SUPPLIER_ID);
        offer.setSupplier(mockedSupplier);

        RejectOffer rejectedOffer = RejectOffer.rejectOfferDtoToEntity(new RejectOfferDto("reason", offer.getId()));

        when(offerRepository.findById(offer.getId())).thenReturn(Optional.of(offer));
        when(principalService.getSupplierId()).thenReturn(mockedSupplier.getId());
        when(rejectOfferRepository.findByOfferId(offer.getId())).thenReturn(Optional.of(rejectedOffer));

        // When
        OfferRejectionReasonDto expectedResult = OfferRejectionReasonDto.entityToOfferRejectionReasonDto(rejectedOffer, offer.getTitle());
        OfferRejectionReasonDto actualResult = offerService.getOfferRejectionReason(offer.getId());

        // Then
        assertEquals(expectedResult, actualResult);
    }

    @Test
    void GivenIdOfOfferFromDifferentSupplier_WhenGetOfferRejectedReason_ThenExpectDtoValidateException() {
        Offer offer = createOffer();
        offer.setId(OFFER_ID);

        Tenant mockedTenant = new Tenant();
        Supplier mockedSupplier = Supplier.builder().tenant(mockedTenant).build();
        mockedSupplier.setId(SUPPLIER_ID);
        offer.setSupplier(mockedSupplier);

        when(offerRepository.findById(offer.getId())).thenReturn(Optional.of(offer));
        when(principalService.getSupplierId()).thenReturn(UUID.randomUUID());

        assertThrows(DtoValidateException.class, () -> offerService.getOfferRejectionReason(offer.getId()));
    }

    @Test
    void GivenIdOfDeletedOffer_WhenGetOfferRejectionReason_ThenExpectDtoValidateException() {
        Offer offer = createOffer();
        offer.setStatus(GenericStatusEnum.REJECTED);
        offer.setActive(false);
        offer.setId(OFFER_ID);

        Tenant mockedTenant = new Tenant();
        Supplier mockedSupplier = Supplier.builder().tenant(mockedTenant).build();
        mockedSupplier.setId(SUPPLIER_ID);
        offer.setSupplier(mockedSupplier);

        when(offerRepository.findById(offer.getId())).thenReturn(Optional.of(offer));
        when(principalService.getSupplierId()).thenReturn(mockedSupplier.getId());

        assertThrows(DtoValidateException.class, () -> offerService.getOfferRejectionReason(offer.getId()));
    }

    @Test
    void GivenMonthly_WhenGetOfferCountsByStatus_ThenExpectSuccess() {

        // Given
        LocalDateTime expectedStartDate = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        OfferStatusCountsDto expectedCounts = new OfferStatusCountsDto(10, 5, 3);

        when(offerRepository.countOffersByStatusForSupplier(SUPPLIER_ID, expectedStartDate))
                .thenReturn(expectedCounts);

        // When
        OfferStatusCountsDto actualCounts = offerService.getOfferCountsByStatus(SUPPLIER_ID, TimeIntervalPeriod.MONTHLY);

        // Then
        assertEquals(expectedCounts, actualCounts);
    }

    @Test
    void GivenQuarterly_WhenGetOfferCountsByStatus_ThenExpectSuccess() {

        // Given
        OfferStatusCountsDto expectedCounts = new OfferStatusCountsDto(8, 2, 4);

        when(offerRepository.countOffersByStatusForSupplier(SUPPLIER_ID, DateUtils.calculateQuarterlyStartDate(LocalDateTime.now())))
                .thenReturn(expectedCounts);

        // When
        OfferStatusCountsDto actualCounts = offerService.getOfferCountsByStatus(SUPPLIER_ID, TimeIntervalPeriod.QUARTERLY);

        // Then
        assertEquals(expectedCounts, actualCounts);
    }

    @Test
    void GivenYearly_WhenGetOfferCountsByStatus_ThenExpectSuccess() {

        // Given
        LocalDateTime expectedStartDate = LocalDateTime.now().withDayOfYear(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        OfferStatusCountsDto expectedCounts = new OfferStatusCountsDto(15, 7, 6);

        when(offerRepository.countOffersByStatusForSupplier(SUPPLIER_ID, expectedStartDate))
                .thenReturn(expectedCounts);

        // When
        OfferStatusCountsDto actualCounts = offerService.getOfferCountsByStatus(SUPPLIER_ID, TimeIntervalPeriod.YEARLY);

        // Then
        assertEquals(expectedCounts, actualCounts);
    }

    private Offer createOffer() {
        Offer offer = new Offer();
        OfferType offerType = new OfferType();
        offerType.setOfferTypeId(1);
        offerType.setOfferTypeLabel("Test Offer Type");
        offer.setId(UUID.randomUUID());
        offer.setTitle("Test");
        offer.setOfferType(offerType);
        offer.setDescription("Test");
        String coordinatesString = String.format("%f,%f", 5.0, 10.0);
        offer.setCoordinatesString(coordinatesString);
        GeometryFactory geometryFactory = new GeometryFactory();
        Point point = geometryFactory.createPoint(new Coordinate(5.0, 10.0));
        offer.setCoordinates(point);
        return offer;
    }

    private Set<UUID> getIds() {
        return new HashSet<>(Arrays.asList(UUID.randomUUID(), UUID.randomUUID()));
    }

    private OfferRequestDto offerRequestDtoBuilder(LocalDate startDate, LocalDate expirationDate, Set<UUID> ids) {
        return OfferRequestDto.builder()
                .title("Title")
                .amount((double) 0)
                .citizenOfferType("CITIZEN_WITH_PASS")
                .description("Description")
                .offerTypeId(0)
                .startDate(startDate)
                .expirationDate(expirationDate)
                .grantsIds(ids)
                .restrictionRequestDto(RestrictionRequestDto.builder().ageRestriction(10).build())
                .build();
    }

    private OfferUsageRequestDto offerTransactionDtoBuilder(UUID offerId) {
        return OfferUsageRequestDto.builder()
                .amount(2.0)
                .currentTime("20:00:00")
                .offerId(offerId)
                .build();
    }

    private OfferType offerTypeBuilder() {
        return OfferType.builder().offerTypeId(1).offerTypeLabel("test").build();
    }

    private Offer offerBuilder() {
        Offer offer = Offer.builder()
                .amount(2.22)
                .title("title")
                .description("description")
                .expirationDate(LocalDate.now())
                .offerType(offerTypeBuilder())
                .startDate(LocalDate.now())
                .status(GenericStatusEnum.ACTIVE)
                .supplier(Supplier.builder()
                        .companyName("CompanyName")
                        .workingHours(List.of())
                        .profile(SupplierProfile.builder()
                                .companyBranchAddress("Address")
                                .build())
                        .build())
                .citizenOfferType("CITIZEN_WITH_PASS")
                .coordinatesString("Test")
                .grants(Set.of())
                .build();
        offer.setId(UUID.randomUUID());
        return offer;
    }

    private Grant grantBuilder() {
        Grant grant = Grant.builder()
                .title("Title")
                .amount(0)
                .createFor(CreatedForEnum.PASS_OWNER)
                .description("Description")
                .startDate(LocalDate.of(2023, 10, 2))
                .expirationDate(LocalDate.of(2023, 10, 4))
                .build();
        grant.setId(UUID.randomUUID());
        return grant;
    }

    private OfferMobileListDto offerMobileListDtotoBuilder() {
        return OfferMobileListDto.builder()
                .id(UUID.randomUUID())
                .amount(2.22)
                .title("Name")
                .description("description")
                .expirationDate(LocalDate.now())
                .offerType(offerTypeBuilder())
                .startDate(LocalDate.now())
                .status(GenericStatusEnum.ACTIVE)
                .companyName("CompanyName")
                .coordinatesString("Test")
                .citizenOfferType("CITIZEN_WITH_PASS")
                .distance(10D)
                .isActive(true)
                .grants(new HashSet<>())
                .workingHours(new ArrayList<>())
                .build();
    }

    private OfferMobileMapLightDto createOfferMapLightDto(String name, Boolean isActive, String coordinates) {
        return OfferMobileMapLightDto.builder()
                .id(UUID.randomUUID())
                .title(name)
                .description("Test")
                .coordinatesString(coordinates)
                .isActive(isActive)
                .offerType(offerTypeBuilder())
                .build();
    }

}
