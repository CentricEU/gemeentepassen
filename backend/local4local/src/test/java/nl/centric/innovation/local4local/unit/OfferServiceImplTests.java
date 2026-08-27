package nl.centric.innovation.local4local.unit;

import lombok.SneakyThrows;
import nl.centric.innovation.local4local.dto.ApproveOfferDto;
import nl.centric.innovation.local4local.dto.BenefitLightDto;
import nl.centric.innovation.local4local.dto.BenefitTableDto;
import nl.centric.innovation.local4local.dto.DeleteOffersDto;
import nl.centric.innovation.local4local.dto.DiscountCodeViewDto;
import nl.centric.innovation.local4local.dto.FilterOfferRequestDto;
import nl.centric.innovation.local4local.dto.OfferMobileDetailDto;
import nl.centric.innovation.local4local.dto.OfferMobileListDto;
import nl.centric.innovation.local4local.dto.OfferMobileMapLightDto;
import nl.centric.innovation.local4local.dto.OfferMobileMapLightView;
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
import nl.centric.innovation.local4local.entity.Benefit;
import nl.centric.innovation.local4local.entity.Category;
import nl.centric.innovation.local4local.entity.Offer;
import nl.centric.innovation.local4local.entity.OfferType;
import nl.centric.innovation.local4local.entity.Passholder;
import nl.centric.innovation.local4local.entity.RejectOffer;
import nl.centric.innovation.local4local.entity.Role;
import nl.centric.innovation.local4local.entity.Supplier;
import nl.centric.innovation.local4local.entity.SupplierProfile;
import nl.centric.innovation.local4local.entity.Tenant;
import nl.centric.innovation.local4local.entity.User;
import nl.centric.innovation.local4local.enums.FrequencyOfUse;
import nl.centric.innovation.local4local.enums.GenericStatusEnum;
import nl.centric.innovation.local4local.enums.TimeIntervalPeriod;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.repository.DiscountCodeRepository;
import nl.centric.innovation.local4local.repository.OfferRepository;
import nl.centric.innovation.local4local.repository.OfferTypeRepository;
import nl.centric.innovation.local4local.repository.PassholderRepository;
import nl.centric.innovation.local4local.repository.RejectOfferRepository;
import nl.centric.innovation.local4local.repository.TenantRepository;
import nl.centric.innovation.local4local.service.impl.BenefitService;
import nl.centric.innovation.local4local.service.impl.DiscountCodeService;
import nl.centric.innovation.local4local.service.impl.OfferSearchHistoryService;
import nl.centric.innovation.local4local.service.impl.OfferService;
import nl.centric.innovation.local4local.service.impl.PrincipalService;
import nl.centric.innovation.local4local.service.impl.SupplierService;
import nl.centric.innovation.local4local.service.impl.UserService;
import nl.centric.innovation.local4local.service.interfaces.EmailService;
import nl.centric.innovation.local4local.service.interfaces.RestrictionService;
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
import org.mockito.Mockito;
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
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

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
    private BenefitService benefitService;

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
    private TenantRepository tenantRepository;

    @Mock
    private PassholderRepository passholderRepository;

    @Mock
    private DiscountCodeService discountCodeService;

    @Mock
    private OfferSearchHistoryService offerSearchHistoryService;
    private static final UUID SUPPLIER_ID = UUID.randomUUID();
    private static final UUID OFFER_ID = UUID.randomUUID();
    private static final Double LATITUDE = 52.364246;
    private static final Double LONGITUDE = 4.942446;

    private static final Double MIN_LATITUDE = 0.0;
    private static final Double MAX_LATITUDE = 1.0;
    private static final Double MIN_LONGITUDE = 0.0;
    private static final Double MAX_LONGITUDE = 1.0;

    private static final UUID TENANT_ID = UUID.randomUUID();
    private static final UUID PASSHOLDER_ID = UUID.randomUUID();

    private static Stream<Arguments> customAvailability() {
        return Stream.of(Arguments.of(LocalDate.now(), LocalDate.now()),
                Arguments.of(LocalDate.of(2023, 12, 10), LocalDate.of(2023, 10, 11)));
    }

    private static List<Arguments> provideTestCases() {
        return List.of(
                Arguments.of("Test", List.of("Test Offer 1", "Test Offer 2")),
                Arguments.of("NonExistent", Collections.emptyList())
        );
    }

    @Test
    @SneakyThrows
    void GivenValidRequest_WhenCreateOffer_ThenExpectSuccess() {
        // Given
        UUID tenantId = UUID.randomUUID();

        Benefit benefit = Benefit.builder()
                .name("Title")
                .description("Description")
                .tenantId(tenantId)
                .startDate(LocalDate.of(2023, 1, 1))
                .expirationDate(LocalDate.of(2023, 12, 30))
                .build();
        benefit.setId(UUID.randomUUID());
        String coordinatesString = "test";
        RestrictionRequestDto restrictionRequestDto = RestrictionRequestDto.builder().frequencyOfUse(FrequencyOfUse.DAILY).build();
        UUID benefitId = benefit.getId();

        OfferRequestDto offerRequestDto = offerRequestDtoBuilder(LocalDate.of(2023, 10, 2), LocalDate.of(2023, 12, 11), benefitId);

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
        when(benefitService.findById(benefit.getId())).thenReturn(Optional.of(benefit));

        when(principalService.getTenantId()).thenReturn(tenantId);
        when(offerTypeRepository.findById(offerRequestDto.offerTypeId())).thenReturn(Optional.of(offerTypeMock));
        when(principalService.getSupplierId()).thenReturn(supplierId);
        when(supplierService.findBySupplierId(supplierId)).thenReturn(Optional.of(supplier));
        when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(tenant));
        when(principalService.getUser()).thenReturn(user);
        when(restrictionService.saveRestriction(restrictionRequestDto))
                .thenReturn(ModelConverter.restrictionRequestDtoToEntity(restrictionRequestDto));

        offerTypeRepository.findById(offerRequestDto.offerTypeId());

        List<OfferViewDto> result = offerService.createOffer(offerRequestDto, "en-US");

        // Then
        verify(offerRepository).save(any(Offer.class));

        assertNotNull(result);
    }


    @Test
    @SneakyThrows
    void GivenNullOfferType_WhenCreateOffer_ThenExpectError() {
        OfferRequestDto offerRequestDto = offerRequestDtoBuilder(LocalDate.of(2023, 10, 2), LocalDate.of(2023, 12, 11), UUID.randomUUID());

        // when(offerTypeRepository.findById(offerRequestDto.offerTypeId())).thenReturn(Optional.empty());

        assertThrows(DtoValidateException.class, () -> offerService.createOffer(offerRequestDto, "en-US"));
    }

    @Test
    @SneakyThrows
    void GivenWrongSupplierInContext_WhenCreateOffer_ThenExpectError() {
        // Given
        OfferRequestDto offerRequestDto = offerRequestDtoBuilder(LocalDate.of(2023, 10, 2), LocalDate.of(2023, 12, 11), UUID.randomUUID());

        // Then
        assertThrows(DtoValidateException.class, () -> offerService.createOffer(offerRequestDto, "en-US"));
    }

    @Test
    @SneakyThrows
    void GivenNullIds_WhenCreateOffer_ThenExpectError() {
        OfferRequestDto offerRequestDto = offerRequestDtoBuilder(LocalDate.of(2023, 10, 2), LocalDate.of(2023, 12, 11), UUID.randomUUID()
        );

        //when(offerTypeRepository.findById(offerRequestDto.offerTypeId())).thenReturn(Optional.empty());

        assertThrows(DtoValidateException.class, () -> offerService.createOffer(offerRequestDto, "en-US"));
    }

    @Test
    @SneakyThrows
    void GivenNullIds_WhenCreateOfferWithGrant_ThenExpectError() {
        OfferRequestDto offerRequestDto = offerRequestDtoBuilder(LocalDate.of(2023, 10, 2), LocalDate.of(2023, 12, 11), UUID.randomUUID());

        OfferType offerTypeMock = OfferType.builder().offerTypeId(0).offerTypeLabel("test").build();

        //when(offerTypeRepository.findById(offerRequestDto.offerTypeId())).thenReturn(Optional.of(offerTypeMock));

        assertThrows(DtoValidateException.class, () -> offerService.createOffer(offerRequestDto, "en-US"));
    }

    @ParameterizedTest
    @MethodSource("customAvailability")
    void GivenInvalidAvailability_WhenCreateOffer_ThenExpectDtoValidateException(LocalDate starDate,
                                                                                 LocalDate expirationDate) {

        // Given
        OfferRequestDto requestDto = offerRequestDtoBuilder(starDate, expirationDate, UUID.randomUUID());

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
        Pageable pageable = PageRequest.of(0, 25, Sort.by("title"));
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
        Pageable pageable = PageRequest.of(0, 25, Sort.by("title"));
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

        // Tenant & supplier
        Tenant mockedTenant = Tenant.builder().name("TestTenant").build();
        Supplier mockedSupplier = Supplier.builder().tenant(mockedTenant).build();
        mockedSupplier.setId(SUPPLIER_ID);

        // Offer
        Offer offerMock = Offer.builder()
                .status(GenericStatusEnum.PENDING)
                .supplier(mockedSupplier)
                .version(0L) // match DTO version
                .build();

        UUID offerId = OFFER_ID; // make sure it matches the stub

        // DTO with proper values
        ApproveOfferDto approveOfferDto = ApproveOfferDto.builder()
                .offerId(offerId)
                .version(offerMock.getVersion())
                .build();

        // Mocks
        when(supplierService.findBySupplierId(SUPPLIER_ID)).thenReturn(Optional.of(mockedSupplier));
        when(offerRepository.findById(offerId)).thenReturn(Optional.of(offerMock));
        when(userServiceMock.getEmailsBySupplierId(SUPPLIER_ID)).thenReturn(emails);

        // When
        offerService.approveOffer(approveOfferDto, language);

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
        when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(mockedTenant));

        when(userServiceMock.findAllAdminsByTenantId(tenantId)).thenReturn(adminList);

        doNothing().when(emailService).sendOfferReviewEmail(any(), any(), any(), any(), any(), any());

        offerService.sendReviewOfferEmail(tenantId, language, user);

        // Then
        verify(tenantRepository, times(1)).findById(tenantId);
        verify(userServiceMock, times(1)).findAllAdminsByTenantId(tenantId);
        verify(emailService, times(1)).sendOfferReviewEmail(any(), any(), any(), any(), any(), any());
    }

    @Test
    void GivenNotExistingTenant_WhenSendReviewOfferEmail_ThenExpectDtoValidateNotFoundException() {

        // Given
        UUID nonExistentTenantId = UUID.randomUUID();
        String language = "en";
        User user = new User();

        when(tenantRepository.findById(nonExistentTenantId)).thenReturn(Optional.empty());

        // Then
        assertThrows(DtoValidateNotFoundException.class, () -> offerService
                .sendReviewOfferEmail(nonExistentTenantId, language, user));

        verify(tenantRepository, times(1)).findById(nonExistentTenantId);
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
        UUID citizenId = UUID.randomUUID();
        User mockUser = new User();
        mockUser.setId(citizenId);

        when(principalService.getUser()).thenReturn(mockUser);
        when(principalService.getTenantId()).thenReturn(tenantId);
        when(offerRepository.findAllOffersOrderedByDistanceToUser(pageable, LATITUDE, LONGITUDE, tenantId, localDate, citizenId, 1)).thenReturn(Collections.emptyList());
        // When
        List<OfferMobileListDto> result = offerService.getOffersOrderedByDistanceToUser(page, LATITUDE, LONGITUDE, localDate, "", 1);

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
        UUID citizenId = UUID.randomUUID();
        User mockUser = new User();
        mockUser.setId(citizenId);

        when(principalService.getUser()).thenReturn(mockUser);
        when(principalService.getTenantId()).thenReturn(tenantId);
        when(offerRepository.findAllOffersOrderedByDistanceToUser(pageable, LATITUDE, LONGITUDE, tenantId, localDate, citizenId, 1)).thenReturn(List.of(offerMobileListDtotoBuilder()));
        // When
        List<OfferMobileListDto> result = offerService.getOffersOrderedByDistanceToUser(page, LATITUDE, LONGITUDE, localDate, "", 1);

        // Then
        assertEquals(1, result.size());
    }

    @Test
    @SneakyThrows
    void GivenValidDataButOneOfferWithSearch_WhenGetOffersOrderedByDistanceToUser_ThenExpectOneOffer() {
        // Given
        int page = 0;
        Pageable pageable = PageRequest.of(page, 20);
        UUID tenantId = UUID.randomUUID();
        LocalDate localDate = LocalDate.of(2025, 3, 4);
        String searchKeyword = "test";
        UUID citizenId = UUID.randomUUID();
        User mockUser = new User();
        mockUser.setId(citizenId);

        when(principalService.getUser()).thenReturn(mockUser);
        when(principalService.getTenantId()).thenReturn(tenantId);
        doNothing().when(offerSearchHistoryService).saveSearchHistory(searchKeyword);
        when(offerRepository.findSearchedOffersOrderedByDistanceToUser(pageable, LATITUDE, LONGITUDE, tenantId, localDate, citizenId, searchKeyword, 1)).thenReturn(List.of(offerMobileListDtotoBuilder()));
        // When
        List<OfferMobileListDto> result = offerService.getOffersOrderedByDistanceToUser(page, LATITUDE, LONGITUDE, localDate, searchKeyword, 1);

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
        assertThrows(DtoValidateException.class, () ->
                offerService.getOffersOrderedByDistanceToUser(page, latitude, longitude, LocalDate.of(2030, 4, 3), "", 1));
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
        // Given
        UUID citizenId = UUID.randomUUID();
        User user = new User();
        user.setId(citizenId);
        when(principalService.getUser()).thenReturn(user);

        Passholder passholder = new Passholder();
        passholder.setUser(user);
        passholder.expiringDate = LocalDate.now().plusDays(1);
        when(passholderRepository.findByUserId(citizenId)).thenReturn(Optional.of(passholder));

        OfferUsageRequestDto offerUsageRequestDto = offerTransactionDtoBuilder(UUID.randomUUID());

        when(offerRepository.findByIdAndStatusWithBenefitAccess(
                offerUsageRequestDto.offerId(),
                GenericStatusEnum.ACTIVE,
                citizenId))
                .thenReturn(Optional.empty());

        // Then
        assertThrows(DtoValidateNotFoundException.class,
                () -> offerService.useOffer(offerUsageRequestDto));
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

        Passholder passholder = new Passholder();
        passholder.setUser(user);
        passholder.setExpiringDate(LocalDate.now().plusDays(5));
        when(passholderRepository.findByUserId(userId)).thenReturn(Optional.of(passholder));

        Offer offer = new Offer();
        offer.setId(offerId);
        offer.setAmount(10.0);
        offer.setStartDate(LocalDate.now().minusDays(1));
        offer.setExpirationDate(LocalDate.now().plusDays(1));

        Benefit benefit = new Benefit();
        benefit.setExpirationDate(LocalDate.now().plusDays(5));
        offer.setBenefit(benefit);

        OfferUsageRequestDto offerUsageRequestDto = OfferUsageRequestDto.builder()
                .offerId(offerId)
                .amount(5.0)
                .currentTime("20:00:00")
                .build();

        when(offerRepository.findByIdAndStatusWithBenefitAccess(offerId, GenericStatusEnum.ACTIVE, userId))
                .thenReturn(Optional.of(offer));

        DiscountCodeViewDto mockDiscountCodeViewDto = DiscountCodeViewDto.builder()
                .code("DISCOUNT2024")
                .companyName("Test")
                .offerTitle("Test")
                .offerType(new OfferType())
                .amount(10.0)
                .companyLogo("Test")
                .isActive(true)
                .expirationDate(LocalDate.now().plusDays(10))
                .build();

        when(discountCodeService.save(offerId, userId)).thenReturn(mockDiscountCodeViewDto);

        // Then
        assertDoesNotThrow(() -> offerService.useOffer(offerUsageRequestDto));
    }

    @Test
    @SneakyThrows
    void GivenAmountExceedsOfferAmount_WhenUseOffer_ThenExpectError() {
        // Given
        User user = new User();
        UUID userId = UUID.randomUUID();
        user.setId(userId);
        when(principalService.getUser()).thenReturn(user);

        Passholder passholder = new Passholder();
        passholder.setUser(user);

        passholder.expiringDate = LocalDate.now().plusDays(5);
        when(passholderRepository.findByUserId(userId)).thenReturn(Optional.of(passholder));

        Offer offer = new Offer();
        offer.setAmount(10.0);
        offer.setStartDate(LocalDate.now().minusDays(1));
        offer.setExpirationDate(LocalDate.now().plusDays(1));

        Benefit benefit = new Benefit();
        benefit.setExpirationDate(LocalDate.now().plusDays(5));
        offer.setBenefit(benefit);

        OfferUsageRequestDto offerUsageRequestDto = OfferUsageRequestDto.builder()
                .offerId(UUID.randomUUID())
                .amount(15.0)
                .currentTime("20:00:00")
                .build();

        when(offerRepository.findByIdAndStatusWithBenefitAccess(
                offerUsageRequestDto.offerId(),
                GenericStatusEnum.ACTIVE,
                userId))
                .thenReturn(Optional.of(offer));

        // Then
        assertThrows(DtoValidateException.class,
                () -> offerService.useOffer(offerUsageRequestDto),
                "Amount requested exceeds available offer amount.");
    }


    @Test
    void givenValidRequest_whenCountFilteredOffers_thenReturnCount() {
        // Given
        FilterOfferRequestDto filterParams = FilterOfferRequestDto.builder()
                .status(GenericStatusEnum.ACTIVE)
                .offerTypeId(1)
                .benefitId(UUID.randomUUID())
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
        // Given
        User user = new User();
        UUID userId = UUID.randomUUID();
        user.setId(userId);
        when(principalService.getUser()).thenReturn(user);

        Passholder passholder = new Passholder();
        passholder.setUser(user);

        passholder.expiringDate = LocalDate.now().plusDays(1);
        when(passholderRepository.findByUserId(userId)).thenReturn(Optional.of(passholder));

        Offer offer = new Offer();
        offer.setAmount(10.0);
        offer.setStartDate(LocalDate.now().plusDays(1));
        offer.setExpirationDate(LocalDate.now().minusDays(1));

        Benefit benefit = new Benefit();
        benefit.setExpirationDate(LocalDate.now().plusDays(5));
        offer.setBenefit(benefit);

        OfferUsageRequestDto offerUsageRequestDto = OfferUsageRequestDto.builder()
                .offerId(UUID.randomUUID())
                .amount(5.0)
                .currentTime("20:00:00")
                .build();

        when(offerRepository.findByIdAndStatusWithBenefitAccess(
                offerUsageRequestDto.offerId(), GenericStatusEnum.ACTIVE, userId))
                .thenReturn(Optional.of(offer));

        // Then
        assertThrows(DtoValidateException.class,
                () -> offerService.useOffer(offerUsageRequestDto),
                "Expected exception when current date is outside offer range");
    }


    @Test
    @SneakyThrows
    void GivenNoPassholder_WhenUseOffer_ThenExpectNotFoundError() {
        UUID citizenId = UUID.randomUUID();
        User user = new User();
        user.setId(citizenId);
        when(principalService.getUser()).thenReturn(user);

        OfferUsageRequestDto dto = offerTransactionDtoBuilder(UUID.randomUUID());

        when(passholderRepository.findByUserId(citizenId)).thenReturn(Optional.empty());

        assertThrows(DtoValidateNotFoundException.class,
                () -> offerService.useOffer(dto),
                "Expected not found when passholder is missing");
    }

    @Test
    @SneakyThrows
    void GivenExpiredPassholder_WhenUseOffer_ThenExpectExpiredError() {
        UUID citizenId = UUID.randomUUID();
        User user = new User();
        user.setId(citizenId);
        when(principalService.getUser()).thenReturn(user);

        Passholder passholder = new Passholder();
        passholder.expiringDate = LocalDate.now().minusDays(1);
        when(passholderRepository.findByUserId(citizenId)).thenReturn(Optional.of(passholder));

        OfferUsageRequestDto dto = offerTransactionDtoBuilder(UUID.randomUUID());

        assertThrows(DtoValidateException.class,
                () -> offerService.useOffer(dto),
                "Expected exception for expired passholder");
    }

    @Test
    @SneakyThrows
    void GivenExpiredBenefit_WhenUseOffer_ThenExpectBenefitExpiredError() {
        UUID citizenId = UUID.randomUUID();
        User user = new User();
        user.setId(citizenId);
        when(principalService.getUser()).thenReturn(user);

        Passholder passholder = new Passholder();
        passholder.setUser(user);

        passholder.expiringDate = LocalDate.now().plusDays(1);
        when(passholderRepository.findByUserId(citizenId)).thenReturn(Optional.of(passholder));

        Offer offer = new Offer();
        offer.setStartDate(LocalDate.now().minusDays(1));
        offer.setExpirationDate(LocalDate.now().plusDays(1));

        Benefit benefit = new Benefit();
        benefit.setExpirationDate(LocalDate.now().minusDays(1)); // expired
        offer.setBenefit(benefit);

        OfferUsageRequestDto dto = offerTransactionDtoBuilder(UUID.randomUUID());

        when(offerRepository.findByIdAndStatusWithBenefitAccess(dto.offerId(), GenericStatusEnum.ACTIVE, citizenId))
                .thenReturn(Optional.of(offer));

        assertThrows(DtoValidateException.class,
                () -> offerService.useOffer(dto),
                "Expected exception for expired benefit");
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
        Pageable pageable = PageRequest.of(0, 25, Sort.by("title"));
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
    void GivenOffersIds_WhenDeleteOffers_ThenShouldDelete() throws DtoValidateNotFoundException {
        // Given
        List<UUID> offerIds = Arrays.asList(UUID.randomUUID(), UUID.randomUUID());

        Supplier supplier = new Supplier();
        supplier.setId(SUPPLIER_ID);

        Offer offer1 = new Offer();
        offer1.setId(offerIds.get(0));
        offer1.setSupplier(supplier);
        Offer offer2 = new Offer();
        offer2.setId(offerIds.get(1));
        offer2.setSupplier(supplier);

        List<Offer> offers = Arrays.asList(offer1, offer2);

        DeleteOffersDto deleteOffersDto = DeleteOffersDto.builder().offersIds(offerIds).build();

        when(principalService.getSupplierId()).thenReturn(SUPPLIER_ID);
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
        offer.setOfferType(new OfferType(1, "Percentage", true));

        when(principalService.getSupplierId()).thenReturn(SUPPLIER_ID);
        when(offerRepository.findByIdAndSupplierId(offerId, SUPPLIER_ID)).thenReturn(Optional.of(offer));

        // When
        offerService.reactivateOffer(
                new ReactivateOfferDto(
                        offerId,
                        LocalDate.of(2025, 5, 29),
                        LocalDate.of(2030, 2, 12)));

        // Then
        verify(offerRepository, times(1)).findByIdAndSupplierId(offerId, SUPPLIER_ID);
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

        when(principalService.getSupplierId()).thenReturn(SUPPLIER_ID);
        when(offerRepository.findByIdAndSupplierId(offerId, SUPPLIER_ID)).thenReturn(Optional.empty());

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
        Benefit benefit = Benefit.builder()
                .name("Title")
                .description("Description")
                .startDate(LocalDate.of(2023, 10, 2))
                .expirationDate(LocalDate.of(2023, 10, 4))
                .build();

        benefit.setId(UUID.randomUUID());

        UUID supplierId = UUID.randomUUID();
        FilterOfferRequestDto filterParams = FilterOfferRequestDto.builder()
                .status(GenericStatusEnum.ACTIVE)
                .offerTypeId(1)
                .benefitId(UUID.randomUUID())
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
        offer.setBenefit(benefit);
        List<Offer> offers = List.of(offer);

        when(principalService.getSupplierId()).thenReturn(supplierId);
        when(offerRepository.findAllWithSpecification(supplierId, filterParams, pageable)).thenReturn(offers);
        List<OfferViewTableDto> expectedOfferViewTableDtos = offers.stream()
                .map(offerEntity -> OfferViewTableDto.entityToOfferViewTableDto(offerEntity))
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
    void GivenOfferDateOutsideBenefitRange_WhenCreateOffer_ThenThrowDtoValidateException() {
        // Given
        UUID tenantId = UUID.randomUUID();

        Benefit benefit = Benefit.builder()
                .name("Title")
                .description("Description")
                .tenantId(tenantId)
                .startDate(LocalDate.of(2023, 10, 10))
                .expirationDate(LocalDate.of(2023, 12, 30))
                .build();
        benefit.setId(UUID.randomUUID());

        User user = new User();
        user.setRole(new Role(1, "ROLE_SUPPLIER"));

        String coordinatesString = "test";
        Supplier supplier = Supplier.builder().companyName("CompanyName").build();
        SupplierProfile supplierProfile = SupplierProfile.builder().coordinatesString(coordinatesString).coordinates(null).build();
        supplier.setProfile(supplierProfile);
        user.setSupplier(supplier);

        //when(principalService.getUser()).thenReturn(user);
        when(benefitService.findById(benefit.getId())).thenReturn(Optional.of(benefit));
        when(principalService.getTenantId()).thenReturn(tenantId);
        //when(principalService.getSupplierId()).thenReturn(UUID.randomUUID());
        //when(supplierService.findBySupplierId(any())).thenReturn(Optional.of(supplier));
        //when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(Tenant.builder().name("tenant").build()));

        // Out-of-range start date (before benefit start)
        UUID benefitId = benefit.getId();
        OfferRequestDto invalidOfferRequest = offerRequestDtoBuilder(
                LocalDate.of(2023, 9, 10), // before benefit start date!
                LocalDate.of(2023, 12, 1), // valid end date
                benefitId
        );

        // Expect
        OfferRequestDto finalInvalidOfferRequest1 = invalidOfferRequest;
        assertThrows(DtoValidateException.class, () ->
                offerService.createOffer(finalInvalidOfferRequest1, "en-US")
        );

        // Out-of-range end date (after benefit end)
        invalidOfferRequest = offerRequestDtoBuilder(
                LocalDate.of(2023, 10, 15),
                LocalDate.of(2024, 1, 1), // after benefit expiration!
                benefitId
        );

        OfferRequestDto finalInvalidOfferRequest = invalidOfferRequest;
        assertThrows(DtoValidateException.class, () ->
                offerService.createOffer(finalInvalidOfferRequest, "en-US")
        );
    }

    @Test
    @SneakyThrows
    void GivenStartDateNotBeforeExpiration_WhenCreateOffer_ThenThrowDtoValidateException() {
        // Given
        UUID tenantId = UUID.randomUUID();

        Benefit benefit = Benefit.builder()
                .name("Title")
                .description("Description")
                .tenantId(tenantId)
                .startDate(LocalDate.of(2023, 1, 1))
                .expirationDate(LocalDate.of(2023, 12, 30))
                .build();
        benefit.setId(UUID.randomUUID());

        User user = new User();
        user.setRole(new Role(1, "ROLE_SUPPLIER"));

        String coordinatesString = "test";
        Supplier supplier = Supplier.builder().companyName("CompanyName").build();
        SupplierProfile supplierProfile = SupplierProfile.builder().coordinatesString(coordinatesString).coordinates(null).build();
        supplier.setProfile(supplierProfile);
        user.setSupplier(supplier);

        //when(principalService.getUser()).thenReturn(user);
        when(benefitService.findById(benefit.getId())).thenReturn(Optional.of(benefit));
        when(principalService.getTenantId()).thenReturn(tenantId);
        //when(principalService.getSupplierId()).thenReturn(UUID.randomUUID());
        //when(supplierService.findBySupplierId(any())).thenReturn(Optional.of(supplier));
        //when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(Tenant.builder().name("tenant").build()));

        // Start and end date the same
        OfferRequestDto invalidOfferRequest = offerRequestDtoBuilder(
                LocalDate.of(2023, 10, 10),
                LocalDate.of(2023, 10, 10),
                benefit.getId()
        );

        OfferRequestDto finalInvalidOfferRequest = invalidOfferRequest;
        assertThrows(DtoValidateException.class, () ->
                offerService.createOffer(finalInvalidOfferRequest, "en-US")
        );

        // End date before start date
        invalidOfferRequest = offerRequestDtoBuilder(
                LocalDate.of(2023, 11, 1),
                LocalDate.of(2023, 10, 1),
                benefit.getId()
        );

        OfferRequestDto finalInvalidOfferRequest1 = invalidOfferRequest;
        assertThrows(DtoValidateException.class, () ->
                offerService.createOffer(finalInvalidOfferRequest1, "en-US")
        );
    }

    @Test
    @SneakyThrows
    void GivenValidOfferId_WhenGetFullOffer_ThenExpectOffer() {
        // Given
        Offer offer = offerBuilder();
        UUID offerId = offer.getId();
        offer.setStatus(GenericStatusEnum.EXPIRED);

        when(principalService.getSupplierId()).thenReturn(SUPPLIER_ID);
        when(offerRepository.findByIdAndSupplierId(offerId, SUPPLIER_ID)).thenReturn(Optional.of(offer));

        // When
        OfferDto offerDto = offerService.getFullOffer(offerId);

        // Then
        assertEquals(offer.getDescription(), offerDto.description());
    }

    @Test
    void GivenInvalidOfferId_WhenGetFullOffer_ThenExpectError() {
        UUID offerId = UUID.randomUUID();

        when(principalService.getSupplierId()).thenReturn(SUPPLIER_ID);
        when(offerRepository.findByIdAndSupplierId(offerId, SUPPLIER_ID)).thenReturn(Optional.empty());

        assertThrows(DtoValidateException.class, () -> offerService.getFullOffer(offerId));
    }

    @Test
    void GivenOffersWithinViewport_WhenGetOffersWithinViewport_ThenSuccess() {
        // Given
        List<OfferMobileMapLightView> mockOffers = Arrays.asList(
                createOfferMapLightView("test1", true, "coordinates1"),
                createOfferMapLightView("test2", false, "coordinates2")
        );
        LocalDate localDate = LocalDate.of(2025, 3, 10);
        UUID tenantId = UUID.randomUUID();
        UUID citizenId = UUID.randomUUID();
        User mockUser = new User();
        mockUser.setId(citizenId);

        when(principalService.getUser()).thenReturn(mockUser);
        when(principalService.getTenantId()).thenReturn(tenantId);
        when(offerRepository.findActiveOffersInViewport(
                MIN_LATITUDE, MAX_LATITUDE, MIN_LONGITUDE, MAX_LONGITUDE,
                localDate, tenantId, 1, citizenId))
                .thenReturn(mockOffers);

        // When
        Map<String, List<OfferMobileMapLightView>> result =
                offerService.getOffersWithinViewport(
                        MIN_LATITUDE, MAX_LATITUDE, MIN_LONGITUDE, MAX_LONGITUDE,
                        localDate, 1, "");

        // Then
        // result is a Map<String, List<OfferMobileMapLightDto>> (grouped by coordinates, for example)
        // If your service groups by coordinates, size will be number of distinct coordinates.
        assertEquals(mockOffers.size(), result.values().stream().mapToInt(List::size).sum());
        verify(offerRepository).findActiveOffersInViewport(
                MIN_LATITUDE, MAX_LATITUDE, MIN_LONGITUDE, MAX_LONGITUDE,
                localDate, tenantId, 1, citizenId);
    }

    @Test
    void GivenNoOffersWithinViewport_WhenGetOffersWithinViewport_ThenEmptyList() {
        // Given
        LocalDate localDate = LocalDate.of(2025, 3, 10);
        UUID tenantId = UUID.randomUUID();
        UUID citizenId = UUID.randomUUID();
        User mockUser = new User();
        mockUser.setId(citizenId);

        when(principalService.getUser()).thenReturn(mockUser);
        when(principalService.getTenantId()).thenReturn(tenantId);
        when(offerRepository.findActiveOffersInViewport(
                MIN_LATITUDE, MAX_LATITUDE, MIN_LONGITUDE, MAX_LONGITUDE,
                localDate, tenantId, 2, citizenId))
                .thenReturn(Collections.emptyList());

        // When
        Map<String, List<OfferMobileMapLightView>> result =
                offerService.getOffersWithinViewport(
                        MIN_LATITUDE, MAX_LATITUDE, MIN_LONGITUDE, MAX_LONGITUDE,
                        localDate, 2, "");

        // Then
        assertTrue(result.isEmpty());
        verify(offerRepository).findActiveOffersInViewport(
                MIN_LATITUDE, MAX_LATITUDE, MIN_LONGITUDE, MAX_LONGITUDE,
                localDate, tenantId, 2, citizenId);
    }

    @Test
    void GivenBoundaryCondition_WhenGetOffersWithinViewport_ThenSuccess() {
        // Given
        List<OfferMobileMapLightView> mockOffers = Arrays.asList(
                createOfferMapLightView("test1", false, "coordinates1"),
                createOfferMapLightView("test2", false, "coordinates1")
        );
        LocalDate localDate = LocalDate.of(2025, 3, 4);
        UUID tenantId = UUID.randomUUID();
        UUID citizenId = UUID.randomUUID();
        User mockUser = new User();
        mockUser.setId(citizenId);

        when(principalService.getUser()).thenReturn(mockUser);
        when(principalService.getTenantId()).thenReturn(tenantId);
        when(offerRepository.findActiveOffersInViewport(
                MIN_LATITUDE, MAX_LATITUDE, MIN_LONGITUDE, MAX_LONGITUDE,
                localDate, tenantId, 1, citizenId))
                .thenReturn(mockOffers);

        // When
        Map<String, List<OfferMobileMapLightView>> result =
                offerService.getOffersWithinViewport(
                        MIN_LATITUDE, MAX_LATITUDE, MIN_LONGITUDE, MAX_LONGITUDE,
                        localDate, 1, "");

        // Then
        // If service groups by coordinates, there should be 1 key ("coordinates1")
        assertEquals(1, result.size());
        verify(offerRepository).findActiveOffersInViewport(
                MIN_LATITUDE, MAX_LATITUDE, MIN_LONGITUDE, MAX_LONGITUDE,
                localDate, tenantId, 1, citizenId);
    }

    @Test
    void GivenBoundaryConditionWithSearch_WhenGetOffersWithinViewport_ThenSuccess() {
        // Given
        List<OfferMobileMapLightView> mockOffers = Arrays.asList(
                createOfferMapLightView("test1", false, "coordinates1"),
                createOfferMapLightView("test2", false, "coordinates1")
        );
        LocalDate localDate = LocalDate.of(2025, 3, 4);
        UUID tenantId = UUID.randomUUID();
        String searchKeyword = "test";
        UUID citizenId = UUID.randomUUID();
        User mockUser = new User();
        mockUser.setId(citizenId);

        when(principalService.getUser()).thenReturn(mockUser);
        when(principalService.getTenantId()).thenReturn(tenantId);
        when(offerRepository.findActiveSearchOffersInViewport(
                MIN_LATITUDE, MAX_LATITUDE, MIN_LONGITUDE, MAX_LONGITUDE,
                localDate, tenantId, 1, citizenId, searchKeyword))
                .thenReturn(mockOffers);

        // When
        Map<String, List<OfferMobileMapLightView>> result =
                offerService.getOffersWithinViewport(
                        MIN_LATITUDE, MAX_LATITUDE, MIN_LONGITUDE, MAX_LONGITUDE,
                        localDate, 1, searchKeyword);

        // Then
        assertEquals(1, result.size()); // again assuming grouping by coordinates
        verify(offerRepository).findActiveSearchOffersInViewport(
                MIN_LATITUDE, MAX_LATITUDE, MIN_LONGITUDE, MAX_LONGITUDE,
                localDate, tenantId, 1, citizenId, searchKeyword);
    }

    @Test
    void GivenInvalidOfferId_WhenRejectOffer_ThenExpectDtoValidateException() {
        when(offerRepository.findById(OFFER_ID)).thenReturn(Optional.empty());

        RejectOfferDto rejectedOffer = new RejectOfferDto("reason", OFFER_ID, 0L);

        assertThrows(DtoValidateException.class, () -> offerService.rejectOffer(rejectedOffer, "en"));
    }

    @Test
    void GivenOfferIdOfNonPendingOffer_WhenRejectOffer_ThenExpectDtoValidateException() {

        Offer offer = createOffer();
        offer.setStatus(GenericStatusEnum.REJECTED);
        RejectOfferDto rejectedOffer = new RejectOfferDto("reason", OFFER_ID, 0L);

        when(offerRepository.findById(OFFER_ID)).thenReturn(Optional.of(offer));

        assertThrows(DtoValidateException.class, () -> offerService.rejectOffer(rejectedOffer, "en"));
    }

    @Test
    @SneakyThrows
    void GivenValidRejectOfferDto_WhenRejectOffer_ThenExpectSuccess() {
        // Given
        String language = "en";

        // Create a sample Offer with PENDING status
        Offer offer = createOffer();
        offer.setStatus(GenericStatusEnum.PENDING);
        offer.setVersion(0L); // ensure version matches RejectOfferDto

        // Set supplier and tenant
        Tenant mockedTenant = new Tenant();
        Supplier mockedSupplier = Supplier.builder()
                .tenant(mockedTenant)
                .build();
        mockedSupplier.setId(SUPPLIER_ID);
        offer.setSupplier(mockedSupplier);

        // Create a valid RejectOfferDto matching the offer
        RejectOfferDto rejectedOffer = new RejectOfferDto(
                "Some reason",
                OFFER_ID,    // must match offer.getId()
                offer.getVersion() // must match offer version
        );

        // Mock repository/service calls
        when(offerRepository.findById(OFFER_ID)).thenReturn(Optional.of(offer));
        when(supplierService.findBySupplierId(SUPPLIER_ID)).thenReturn(Optional.of(mockedSupplier));
        String[] emails = {"email@domain.com"};
        when(userServiceMock.getEmailsBySupplierId(SUPPLIER_ID)).thenReturn(emails);

        // Mock saving RejectOffer (to avoid equals mismatch in verify)
        when(rejectOfferRepository.save(any(RejectOffer.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        offerService.rejectOffer(rejectedOffer, language);

        // Then
        // Verify that a RejectOffer entity was saved (we allow any entity, because equals can fail)
        verify(rejectOfferRepository, times(1)).save(any(RejectOffer.class));

        // Verify that the rejection email was sent correctly
        verify(emailService, times(1))
                .sendOfferRejectedEmail(
                        any(),
                        eq(emails),
                        eq(language),
                        eq(rejectedOffer.reason()),
                        any()
                );
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
    @SneakyThrows
    void GivenValidOfferIdOfRejectedOffer_WhenGetOfferRejectionReason_ThenExpectSuccess() {
        // Given
        Offer offer = createOffer();
        offer.setStatus(GenericStatusEnum.REJECTED);
        offer.setActive(true);
        offer.setId(OFFER_ID);

        Tenant mockedTenant = new Tenant();
        Supplier mockedSupplier = Supplier.builder().tenant(mockedTenant).build();
        mockedSupplier.setId(SUPPLIER_ID);
        offer.setSupplier(mockedSupplier);

        RejectOffer rejectedOffer = RejectOffer.rejectOfferDtoToEntity(new RejectOfferDto("reason", offer.getId(), 0L));

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

    @ParameterizedTest
    @MethodSource("provideTestCases")
    void GivenKeyword_WhenSearchOffersStartingWithKeyword_ThenReturnExpectedOffers(String keyword, List<String> expectedOffers) {
        // Given
        UUID tenantId = UUID.randomUUID();
        UUID citizenId = UUID.randomUUID();
        User mockUser = new User();
        mockUser.setId(citizenId);

        when(principalService.getUser()).thenReturn(mockUser);
        when(principalService.getTenantId()).thenReturn(tenantId);
        when(offerRepository.searchByTitlePrefix(keyword, tenantId, GenericStatusEnum.ACTIVE, citizenId)).thenReturn(expectedOffers);

        // When
        List<String> result = offerService.searchOffersByKeyword(keyword);

        // Then
        assertEquals(expectedOffers, result);
    }

    @Test
    void GivenInvalidAmountForOfferType_WhenCreateOffer_ThenExpectError() {
        // Given
        OfferRequestDto offerRequestDto = OfferRequestDto.builder()
                .offerTypeId(1)
                .amount(150.0)
                .benefitIds(Set.of(UUID.randomUUID()))
                .startDate(LocalDate.now())
                .expirationDate(LocalDate.now().plusDays(10))
                .build();

        // When & Then
        assertThrows(DtoValidateException.class, () -> offerService.createOffer(offerRequestDto, "en-US"));
    }

    @Test
    void givenSupplierNotReviewed_whenEditOffer_thenThrowException() {

        // Given
        Supplier supplier = Supplier.builder()
                .isReviewed(false)
                .build();

        when(principalService.getSupplierId()).thenReturn(SUPPLIER_ID);

        when(supplierService.findBySupplierId(SUPPLIER_ID))
                .thenReturn(Optional.of(supplier));

        OfferRequestDto dto = offerRequestDtoBuilder(LocalDate.of(2023, 10, 2), LocalDate.of(2023, 12, 11), UUID.randomUUID());

        // When / Then
        assertThrows(DtoValidateException.class,
                () -> offerService.editOffer(OFFER_ID, dto, "en-US"));
    }

    @Test
    void givenActiveOfferWithoutClaims_whenEditOffer_thenFullEditAndStatusPending() throws Exception {
        // ---------- GIVEN ----------
        UUID tenantId = UUID.randomUUID();
        UUID benefitId = UUID.randomUUID();
        Integer offerTypeId = 1;

        // Supplier
        Supplier supplier = Supplier.builder()
                .isReviewed(true)
                .companyName("Test Company")
                .build();

        // User
        User user = new User();
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setSupplier(supplier);

        // Tenant
        Tenant tenant = new Tenant();
        tenant.setId(tenantId);
        tenant.setName("Test Tenant");

        // Benefit
        Benefit benefit = Benefit.builder()
                .name("Title")
                .description("Description")
                .tenantId(tenantId)
                .startDate(LocalDate.of(2023, 1, 1))
                .expirationDate(LocalDate.of(2023, 12, 30))
                .build();
        benefit.setId(benefitId);

        // OfferType
        OfferType offerType = offerTypeBuilder();

        // Offer
        Offer offer = createOffer();
        offer.setStatus(GenericStatusEnum.ACTIVE);
        offer.setOfferType(offerType);
        offer.setCitizenOfferType("CITIZEN_WITH_PASS");
        offer.setSupplier(supplier);

        // ---------- MOCKS ----------
        when(principalService.getSupplierId()).thenReturn(SUPPLIER_ID);
        when(principalService.getTenantId()).thenReturn(tenantId);
        when(principalService.getUser()).thenReturn(user);

        when(supplierService.findBySupplierId(SUPPLIER_ID))
                .thenReturn(Optional.of(supplier));

        when(offerRepository.findByIdAndSupplierId(OFFER_ID, SUPPLIER_ID))
                .thenReturn(Optional.of(offer));

        when(discountCodeService.isDiscountCodeClaimedForOffer(OFFER_ID))
                .thenReturn(false);

        when(benefitService.findById(eq(benefitId)))
                .thenReturn(Optional.of(benefit));

        when(offerTypeRepository.findById(eq(offerTypeId)))
                .thenReturn(Optional.of(offerType));

        when(tenantRepository.findById(eq(tenantId)))
                .thenReturn(Optional.of(tenant));

        doNothing().when(emailService)
                .sendOfferReviewEmail(any(), any(), any(), any(), any(), any());

        when(offerRepository.save(any(Offer.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        OfferRequestDto dto = OfferRequestDto.builder()
                .title("New Title")
                .description("New Desc")
                .startDate(LocalDate.of(2023, 10, 2))
                .expirationDate(LocalDate.of(2023, 12, 11))
                .benefitIds(Set.of(benefitId))
                .amount(10.0)
                .citizenOfferType("CITIZEN_WITH_PASS")
                .offerTypeId(offerTypeId)
                .build();

        // ---------- WHEN ----------
        OfferViewDto result = offerService.editOffer(OFFER_ID, dto, "en-US");

        // ---------- THEN ----------
        assertEquals(GenericStatusEnum.PENDING, offer.getStatus());
        assertEquals("New Title", offer.getTitle());
        assertEquals("New Desc", offer.getDescription());
        assertEquals(10.0, offer.getAmount());
        assertEquals(benefit, offer.getBenefit());
        assertEquals(offerType, offer.getOfferType());

        verify(emailService, atLeastOnce())
                .sendOfferReviewEmail(any(), any(), any(), any(), any(), any());
    }


    @ParameterizedTest
    @MethodSource("provideEmptyBenefitIds")
    void GivenEmptyBenefitIds_WhenCreateOffer_ThenThrowDtoValidateNotFoundException(Set<UUID> benefitIds) {
        // Given
        OfferRequestDto offerRequestDto = OfferRequestDto.builder()
                .benefitIds(benefitIds)
                .build();

        // Then
        DtoValidateNotFoundException exception = assertThrows(DtoValidateNotFoundException.class,
                () -> offerService.createOffer(offerRequestDto, "en-US"));
    }

    @Test
    void givenPassholderNotFound_whenGetAllForPassholder_thenThrowNotFoundException() {
        // Given
        when(principalService.getTenantId()).thenReturn(TENANT_ID);
        when(passholderRepository.findByIdAndTenantId(PASSHOLDER_ID, TENANT_ID))
                .thenReturn(Optional.empty());

        // When + Then
        assertThrows(
                DtoValidateNotFoundException.class,
                () -> offerService.getAllForPassholder(PASSHOLDER_ID)
        );

        verify(offerRepository, never())
                .findAllActiveOffersForPassholderId(any(), any());
    }

    @Test
    void givenExpiredPassholder_whenGetAllForPassholder_thenThrowExpiredException() {
        // Given
        Passholder passholder = new Passholder();
        passholder.expiringDate = LocalDate.now().minusDays(1);

        when(principalService.getTenantId()).thenReturn(TENANT_ID);
        when(passholderRepository.findByIdAndTenantId(PASSHOLDER_ID, TENANT_ID))
                .thenReturn(Optional.of(passholder));

        // When + Then
        assertThrows(
                DtoValidateException.class,
                () -> offerService.getAllForPassholder(PASSHOLDER_ID)
        );

        verify(offerRepository, never())
                .findAllActiveOffersForPassholderId(any(), any());
    }

    @Test
    @SneakyThrows
    void givenValidPassholder_whenGetAllForPassholder_thenReturnOfferDtos() throws DtoValidateException {
        // Given
        LocalDate localDate = LocalDate.now();
        Passholder passholder = new Passholder();
        passholder.expiringDate = LocalDate.now().plusDays(5);
        Supplier supplier = new Supplier();
        Benefit benefit = Benefit.builder()
                .name("Title")
                .description("Description")
                .tenantId(TENANT_ID)
                .startDate(localDate)
                .expirationDate(localDate)
                .build();
        benefit.setId(UUID.randomUUID());

        OfferType offerType = new OfferType();
        Offer offer1 = Offer.builder().supplier(supplier).offerType(offerType).startDate(localDate).expirationDate(localDate).benefit(benefit).build();
        Offer offer2 = Offer.builder().supplier(supplier).offerType(offerType).startDate(localDate).expirationDate(localDate).benefit(benefit).build();

        when(principalService.getTenantId()).thenReturn(TENANT_ID);
        when(passholderRepository.findByIdAndTenantId(PASSHOLDER_ID, TENANT_ID))
                .thenReturn(Optional.of(passholder));
        when(offerRepository.findAllActiveOffersForPassholderId(PASSHOLDER_ID, TENANT_ID))
                .thenReturn(List.of(offer1, offer2));

        // When
        List<OfferViewTableDto> result =
                offerService.getAllForPassholder(PASSHOLDER_ID);

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());

        verify(passholderRepository)
                .findByIdAndTenantId(PASSHOLDER_ID, TENANT_ID);
        verify(offerRepository)
                .findAllActiveOffersForPassholderId(PASSHOLDER_ID, TENANT_ID);
    }


    private static Stream<Arguments> provideEmptyBenefitIds() {
        return Stream.of(
                Arguments.of(Collections.emptySet()),
                Arguments.of(Set.of())
        );
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


    private OfferRequestDto offerRequestDtoBuilder(LocalDate startDate, LocalDate expirationDate, UUID benefitId) {
        return OfferRequestDto.builder()
                .title("Title")
                .amount((double) 0)
                .citizenOfferType("CITIZEN_WITH_PASS")
                .description("Description")
                .offerTypeId(0)
                .startDate(startDate)
                .expirationDate(expirationDate)
                .benefitIds(Set.of(benefitId))
                .restrictionRequestDto(RestrictionRequestDto.builder().frequencyOfUse(FrequencyOfUse.DAILY).build())
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
        Benefit benefit = Benefit.builder()
                .name("Title")
                .description("Description")
                .startDate(LocalDate.of(2023, 10, 2))
                .expirationDate(LocalDate.of(2023, 10, 4))
                .build();

        benefit.setId(UUID.randomUUID());

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
                .benefit(benefit)
                .build();

        offer.setId(UUID.randomUUID());
        System.out.println(offer.getId());
        return offer;
    }

    private BenefitTableDto benefitBuilder() {
        BenefitTableDto benefit = BenefitTableDto.builder()
                .id(UUID.randomUUID())
                .name("Title")
                .description("Description")
                .startDate(LocalDate.of(2023, 10, 2))
                .expirationDate(LocalDate.of(2023, 10, 4))
                .build();
        return benefit;
    }

    private OfferMobileListDto offerMobileListDtotoBuilder() {

        BenefitLightDto benefit = BenefitLightDto.builder()
                .id(UUID.randomUUID())
                .name("Title")
                .description("Description")
                .startDate(LocalDate.of(2023, 10, 2))
                .expirationDate(LocalDate.of(2023, 10, 4))
                .build();

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
                .benefit(benefit)
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

    @Test
    @SneakyThrows
    void GivenActiveOffer_WhenSuspendOffer_ThenDeactivateCodesAndExpireOffer() {
        // Given
        UUID offerId = UUID.randomUUID();
        LocalDate originalExpiration = LocalDate.now().plusDays(5);
        Offer offer = Offer.builder()
                .status(GenericStatusEnum.ACTIVE)
                .isActive(true)
                .expirationDate(originalExpiration)
                .build();
        offer.setId(offerId);

        // When
        when(principalService.getSupplierId()).thenReturn(SUPPLIER_ID);
        when(offerRepository.findByIdAndSupplierId(offerId, SUPPLIER_ID)).thenReturn(Optional.of(offer));
        when(offerRepository.save(any(Offer.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Then - should not throw
        assertDoesNotThrow(() -> offerService.suspendOffer(offerId));

        // Verify discount codes were deactivated and offer saved with expired status
        verify(discountCodeRepository).deactivateAllByOfferId(offerId);
        verify(offerRepository).save(any(Offer.class));
        assertEquals(GenericStatusEnum.EXPIRED, offer.getStatus());
        assertEquals(LocalDate.now(), offer.getExpirationDate());
    }

    @Test
    @SneakyThrows
    void GivenNonActiveOffer_WhenSuspendOffer_ThenThrowDtoValidateException() {
        // Given
        UUID offerId = UUID.randomUUID();
        Offer offer = Offer.builder()
                .status(GenericStatusEnum.PENDING)
                .isActive(true)
                .expirationDate(LocalDate.now().plusDays(3))
                .build();
        offer.setId(offerId);

        // When
        when(principalService.getSupplierId()).thenReturn(SUPPLIER_ID);
        when(offerRepository.findByIdAndSupplierId(offerId, SUPPLIER_ID)).thenReturn(Optional.of(offer));

        // Then
        assertThrows(DtoValidateException.class, () -> offerService.suspendOffer(offerId));

        // Ensure no side-effects when validation fails
        verify(discountCodeRepository, never()).deactivateAllByOfferId(any());
        verify(offerRepository, never()).save(any(Offer.class));
    }


    // ===== New security tests for offer ownership (findByIdAndSupplierId) =====

    @Test
    void GivenOfferFromDifferentSupplier_WhenSuspendOffer_ThenExpectDtoValidateNotFoundException() {
        // Given
        UUID offerId = UUID.randomUUID();
        when(principalService.getSupplierId()).thenReturn(SUPPLIER_ID);
        when(offerRepository.findByIdAndSupplierId(offerId, SUPPLIER_ID)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(DtoValidateNotFoundException.class, () -> offerService.suspendOffer(offerId));
    }

    @Test
    void GivenOfferFromDifferentSupplier_WhenReactivateOffer_ThenExpectDtoValidateException() {
        // Given
        UUID offerId = UUID.randomUUID();
        when(principalService.getSupplierId()).thenReturn(SUPPLIER_ID);
        when(offerRepository.findByIdAndSupplierId(offerId, SUPPLIER_ID)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(DtoValidateException.class, () -> offerService.reactivateOffer(
                new ReactivateOfferDto(offerId, LocalDate.of(2025, 1, 1), LocalDate.of(2030, 1, 1))));
    }

    @Test
    void GivenOfferFromDifferentSupplier_WhenGetFullOffer_ThenExpectDtoValidateException() {
        // Given
        UUID offerId = UUID.randomUUID();
        when(principalService.getSupplierId()).thenReturn(SUPPLIER_ID);
        when(offerRepository.findByIdAndSupplierId(offerId, SUPPLIER_ID)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(DtoValidateException.class, () -> offerService.getFullOffer(offerId));
    }

    @Test
    void GivenOffersFromDifferentSupplier_WhenDeleteOffers_ThenExpectDtoValidateNotFoundException() {
        // Given
        List<UUID> offerIds = Arrays.asList(UUID.randomUUID(), UUID.randomUUID());

        Supplier supplierOther = new Supplier();
        supplierOther.setId(UUID.randomUUID()); // different supplier

        Offer offer1 = new Offer();
        offer1.setId(offerIds.get(0));
        offer1.setSupplier(supplierOther);

        Offer offer2 = new Offer();
        offer2.setId(offerIds.get(1));
        offer2.setSupplier(supplierOther);

        DeleteOffersDto deleteOffersDto = DeleteOffersDto.builder().offersIds(offerIds).build();

        when(principalService.getSupplierId()).thenReturn(SUPPLIER_ID);
        when(offerRepository.findAllById(offerIds)).thenReturn(Arrays.asList(offer1, offer2));

        // When & Then
        assertThrows(DtoValidateNotFoundException.class, () -> offerService.deleteOffers(deleteOffersDto));
    }

    private OfferMobileMapLightView createOfferMapLightView(String title,
                                                            boolean isActive,
                                                            String coordinates) {
        OfferMobileMapLightView view = Mockito.mock(OfferMobileMapLightView.class);

        lenient().when(view.getId()).thenReturn(UUID.randomUUID());
        lenient().when(view.getTitle()).thenReturn(title);
        lenient().when(view.getDescription()).thenReturn("Some description for " + title);
        lenient().when(view.getOfferType())
                .thenReturn(OfferType.builder().offerTypeId(-1).build());
        lenient().when(view.getCoordinatesString()).thenReturn(coordinates);
        lenient().when(view.getIsActive()).thenReturn(isActive);

        return view;
    }
}
