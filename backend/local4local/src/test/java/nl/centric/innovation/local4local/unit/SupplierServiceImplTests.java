package nl.centric.innovation.local4local.unit;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.GetObjectRequest;
import com.amazonaws.services.s3.model.S3Object;
import lombok.SneakyThrows;
import nl.centric.innovation.local4local.dto.LatLonDto;
import nl.centric.innovation.local4local.dto.RegisterSupplierDto;
import nl.centric.innovation.local4local.dto.RejectSupplierDto;
import nl.centric.innovation.local4local.dto.SupplierForMapViewDto;
import nl.centric.innovation.local4local.dto.SupplierProfilePatchDto;
import nl.centric.innovation.local4local.dto.SupplierRequestPatchDto;
import nl.centric.innovation.local4local.dto.SupplierViewDto;
import nl.centric.innovation.local4local.entity.RejectSupplier;
import nl.centric.innovation.local4local.entity.Role;
import nl.centric.innovation.local4local.entity.Supplier;
import nl.centric.innovation.local4local.entity.SupplierProfile;
import nl.centric.innovation.local4local.entity.Tenant;
import nl.centric.innovation.local4local.entity.User;
import nl.centric.innovation.local4local.enums.RejectionReason;
import nl.centric.innovation.local4local.enums.StatusUpdateEnum;
import nl.centric.innovation.local4local.enums.SupplierStatusEnum;
import nl.centric.innovation.local4local.exceptions.DtoValidateAlreadyExistsException;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.dto.CashierEmailResultDto;
import nl.centric.innovation.local4local.exceptions.NotFoundException;
import nl.centric.innovation.local4local.exceptions.UnauthorizedActionException;
import nl.centric.innovation.local4local.repository.RejectSupplierRepository;
import nl.centric.innovation.local4local.repository.SupplierRepository;
import nl.centric.innovation.local4local.repository.TenantRepository;
import nl.centric.innovation.local4local.service.impl.PrincipalService;
import nl.centric.innovation.local4local.service.impl.SupplierProfileService;
import nl.centric.innovation.local4local.service.impl.SupplierService;
import nl.centric.innovation.local4local.service.impl.UserService;
import nl.centric.innovation.local4local.service.interfaces.EmailService;
import nl.centric.innovation.local4local.service.interfaces.WorkingHoursService;
import org.javers.core.Changes;
import org.javers.core.Javers;
import org.javers.core.diff.Diff;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.MessageSource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
//import qrgenerator.QRCodeGenerator;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Stream;

import static nl.centric.innovation.local4local.service.impl.SupplierService.ORDER_CRITERIA;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SupplierServiceImplTests {
    @InjectMocks
    private SupplierService supplierService;
    @Mock
    private SupplierRepository supplierRepositoryMock;
    @Mock
    private TenantRepository tenantRepository;
    @Mock
    private RejectSupplierRepository rejectSupplierRepository;
    @Mock
    private UserService userServiceMock;
    @Mock
    private EmailService emailService;
    @Mock
    private AmazonS3 amazonS3Client;

    @Mock
    private PrincipalService principalService;

    @Mock
    private SupplierProfileService supplierProfileService;

    @Mock
    private WorkingHoursService workingHoursService;

    @Mock
    private Javers javers;

    @Mock
    private MessageSource messageSource;

    @Mock
    private Diff diff;

    @Mock
    private Changes changes;

//    @Mock
//    private QRCodeGenerator qrCodeGenerator;

    private Tenant tenant;

    private Supplier supplier;
    private User user;
    private static final String KVK_VALID = "12345678";
    private static final UUID TENANT_ID = UUID.randomUUID();

    private static final UUID SUPPLIER_ID = UUID.randomUUID();

    private static Stream<Arguments> customKvk() {
        return Stream.of(Arguments.of("02345678"), Arguments.of(KVK_VALID), Arguments.of("20678321"));
    }

    @BeforeEach
    void setup() {
        tenant = new Tenant();
        supplier = new Supplier();
        user = new User();
    }

    @ParameterizedTest
    @MethodSource("customKvk")
    @SneakyThrows
    void GivenValid_WhenSaveSupplier_ThenExpectSuccess(String kvk) {
        // Given
        RegisterSupplierDto validSupplierDto = RegisterSupplierDto.builder().agreedTerms(true)
                .tenantId(UUID.randomUUID()).email("centric@centric.com").kvk(kvk).build();

        // When
        when(userServiceMock.findByUsername(any())).thenReturn(Optional.empty());
        when(supplierRepositoryMock.save(any())).thenReturn(mock(Supplier.class));

        supplierService.save(validSupplierDto, Optional.of(tenant), "en");

        // Then
        verify(userServiceMock, times(1)).saveForSupplier(any(), any());

    }

    @Test()
    void GivenNoTenant_WhenSaveSupplier_ThenExpectDtoValidateNotFoundException() {
        // Given
        RegisterSupplierDto invalidSupplierDto = RegisterSupplierDto.builder().agreedTerms(true).kvk(KVK_VALID).build();

        // When Then
        assertThrows(DtoValidateNotFoundException.class, () -> supplierService.save(invalidSupplierDto, Optional.empty(), "en"));

    }

    @Test
    void GivenUserWithEmailEmailAlreadyExisting_WhenSaveSupplier_ThenExpectDtoValidateAlreadyExistsException() {
        // Given
        RegisterSupplierDto duplicateEmailSupplierDto = RegisterSupplierDto.builder().agreedTerms(true).kvk(KVK_VALID)
                .build();

        // WHen
        when(userServiceMock.findByUsername(any())).thenReturn(Optional.of(user));

        // Then
        assertThrows(DtoValidateAlreadyExistsException.class, () -> supplierService.save(duplicateEmailSupplierDto, Optional.of(tenant), "nl-NL"));

    }

    @Test
    void GivenTermsAndConditionNotAgreed_WhenSaveSupplier_ThenExpectDtoValidateException() {
        // Given
        RegisterSupplierDto termsNotAgreedSupplierDto = RegisterSupplierDto.builder().agreedTerms(false).kvk(KVK_VALID)
                .build();

        // When Then
        assertThrows(DtoValidateException.class, () -> supplierService.save(termsNotAgreedSupplierDto, Optional.of(tenant), "nl-NL"));

    }

    @Test
    void GivenKvkNotValid_WhenSaveSupplier_ThenExpectDtoValidateException() {
        // Given
        RegisterSupplierDto termsNotAgreedSupplierDto = RegisterSupplierDto.builder().agreedTerms(true).kvk("3128")
                .build();

        // When Then
        assertThrows(DtoValidateException.class, () -> supplierService.save(termsNotAgreedSupplierDto, Optional.of(tenant), "nl-NL"));
    }

    @Test
    void GivenNotExistingTenantId_WhenGetSuppliers_ThenExpectDtoValidateException() {
        // When Then
        assertThrows(DtoValidateException.class,
                () -> supplierService.getAllByTenantIdAndStatus(TENANT_ID, 0, 25, SupplierStatusEnum.APPROVED));
    }

    @Test
    void GivenNotExistingTenantId_WhenGetSuppliersAndMultipleStatus_ThenExpectDtoValidateException() {
        // Given
        Set<SupplierStatusEnum> statusSet = new HashSet<>();
        statusSet.add(SupplierStatusEnum.PENDING);
        statusSet.add(SupplierStatusEnum.REJECTED);

        // When Then
        assertThrows(DtoValidateException.class,
                () -> supplierService.getAllByTenantIdAndStatusIn(TENANT_ID, 0, 25, statusSet));
    }

    @Test
    @SneakyThrows
    void GivenValidTenantId_WhenGetAllByTenantId_ThenSuppliersDtosReturned() {
        // Given
        Set<SupplierStatusEnum> statusSet = new HashSet<>();
        statusSet.add(SupplierStatusEnum.PENDING);
        statusSet.add(SupplierStatusEnum.REJECTED);

        Tenant tenant1 = new Tenant();
        tenant1.setId(TENANT_ID);

        List<Supplier> mockSupplierList = List.of(new Supplier(), new Supplier()); // Replace with actual User objects
        Page<Supplier> mockSupplierPage = new PageImpl<>(mockSupplierList);

        // When
        when(principalService.getTenantId()).thenReturn(TENANT_ID);
        when(tenantRepository.findById(TENANT_ID)).thenReturn(Optional.of(tenant1));
        when(supplierRepositoryMock.findAllByTenantIdAndStatusInOrderByCreatedDateDesc(TENANT_ID, PageRequest.of(0, 25, Sort.by(ORDER_CRITERIA)), statusSet))
                .thenReturn(mockSupplierPage);

        List<SupplierViewDto> supplierViewDtos = supplierService.getAllByTenantIdAndStatusIn(TENANT_ID, 0, 25, statusSet);

        // Then
        assertNotNull(supplierViewDtos);
        assertEquals(mockSupplierList.size(), supplierViewDtos.size());
    }

    @Test
    @SneakyThrows
    void GivenValidTenantId_WhenGetAllByTenantIdAndStatusIn_ThenSuppliersDtosReturned() {
        // Given
        Tenant tenant1 = new Tenant();
        tenant1.setId(TENANT_ID);

        List<Supplier> mockSupplierList = List.of(new Supplier(), new Supplier()); // Replace with actual User objects
        Page<Supplier> mockSupplierPage = new PageImpl<>(mockSupplierList);

        // When
        when(principalService.getTenantId()).thenReturn(TENANT_ID);
        when(tenantRepository.findById(TENANT_ID)).thenReturn(Optional.of(tenant1));
        when(supplierRepositoryMock.findAllByTenantIdAndStatus(TENANT_ID, PageRequest.of(0, 25, Sort.by(ORDER_CRITERIA)), SupplierStatusEnum.APPROVED))
                .thenReturn(mockSupplierPage);

        List<SupplierViewDto> supplierViewDtos = supplierService.getAllByTenantIdAndStatus(TENANT_ID, 0, 25, SupplierStatusEnum.APPROVED);

        // Then
        assertNotNull(supplierViewDtos);
        assertEquals(mockSupplierList.size(), supplierViewDtos.size());
    }

    @Test
    @SneakyThrows
    void GivenValidTenantId_WhenCountByTenantId_ThenShouldCount() {

        tenant.setId(TENANT_ID);
        when(principalService.getTenantId()).thenReturn(TENANT_ID);
        when(tenantRepository.findById(TENANT_ID)).thenReturn(Optional.of(tenant));
        when(supplierRepositoryMock.countByTenantIdAndStatusIn(TENANT_ID, Set.of(SupplierStatusEnum.APPROVED))).thenReturn(2);

        Integer count = supplierService.countAllByTenantIdAndStatus(TENANT_ID, Set.of(SupplierStatusEnum.APPROVED));

        assertEquals(2, count);
    }

    @Test
    void GivenNotExistingTenantId_WhenCountSuppliers_ThenExpectDtoValidateException() {
        assertThrows(DtoValidateNotFoundException.class, () -> {
            supplierService.countAllByTenantIdAndStatus(TENANT_ID, Set.of(SupplierStatusEnum.APPROVED));
        });
    }

    @Test
    void GivenNotExistingSupplierId_WhenApproveSupplier_ThenExpectDtoValidateException() {
        // When Then
        assertThrows(DtoValidateNotFoundException.class,
                () -> supplierService.approveSupplier(SUPPLIER_ID, "en-Us"));
    }

    @Test
    @SneakyThrows
    void GivenValidSupplierId_WhenApproveSupplier_ThenShouldUpdate() {
        //Given
        Tenant mockedTenand = Tenant.builder().name("TestTenant").build();
        Supplier mockedSupplier = Supplier.builder().tenant(mockedTenand).build();
        mockedSupplier.setId(SUPPLIER_ID);
        List<User> userList = Arrays.asList(User.builder().username("username1").build(),
                User.builder().username("username2").build());
        BufferedImage dummyImage = new BufferedImage(100, 100, BufferedImage.TYPE_INT_RGB);

        //When
        when(supplierService.findBySupplierId(SUPPLIER_ID)).thenReturn(Optional.of(mockedSupplier));
        when(userServiceMock.findAllSuppliersBySupplierId(mockedSupplier.getId())).thenReturn(userList);
        //when(qrCodeGenerator.generateQRCodeImage("https://www.google.com/")).thenReturn(dummyImage);
        doNothing().when(emailService).sendApproveProfileEmail(any(), any(), any(), any(), any());

        supplierService.approveSupplier(SUPPLIER_ID, "en-Us");

        //Then
        verify(supplierRepositoryMock, times(1)).save(mockedSupplier);
    }

    @Test
    @SneakyThrows
    void GivenValidData_WhenSendReviewEmailToSupplierWithApproved_ThenExpectSendApproveProfileEmailToBeCalled() {

        // Given
        UUID supplierId = UUID.randomUUID();
        String language = "en";

        Tenant mockedTenand = Tenant.builder().name("TestTenant").build();
        Supplier mockedSupplier = Supplier.builder().tenant(mockedTenand).build();
        mockedSupplier.setId(supplierId);
        List<User> userList = Arrays.asList(User.builder().username("username1").build(),
                User.builder().username("username2").build());

        // When
        when(userServiceMock.findAllSuppliersBySupplierId(supplierId)).thenReturn(userList);

        doNothing().when(emailService).sendApproveProfileEmail(any(), any(), any(), any(), any());

        supplierService.sendReviewEmailToSupplier(mockedSupplier, SupplierStatusEnum.APPROVED, language);

        // Then
        verify(emailService, times(1)).sendApproveProfileEmail(any(), any(), any(), any(), any());
    }

    @Test
    @SneakyThrows
    void GivenValidData_WhenSendReviewEmailToSupplier_ThenExpectEmailServiceNotToBeCalled() {
        // Given
        UUID supplierId = UUID.randomUUID();
        String language = "en";

        Tenant mockedTenand = Tenant.builder().name("TestTenant").build();
        Supplier mockedSupplier = Supplier.builder().tenant(mockedTenand).build();
        mockedSupplier.setId(supplierId);

        List<User> userList = Arrays.asList(User.builder().username("username1").build(),
                User.builder().username("username2").build());

        // When
        when(userServiceMock.findAllSuppliersBySupplierId(supplierId)).thenReturn(userList);

        supplierService.sendReviewEmailToSupplier(mockedSupplier, SupplierStatusEnum.REJECTED, language);

        // Then
        verify(emailService, never()).sendApproveProfileEmail(any(), any(), any(), any(), any());
    }

    @Test
    void GivenValidData_WhenUpdateSupplierHasStatusUpdate_ThenExpectRepostitoryToBeCalled() {
        // Given
        UUID supplierId = UUID.randomUUID();

        // When

        doNothing().when(supplierRepositoryMock).updateSupplierHasStatusUpdate(supplierId, StatusUpdateEnum.SIMPLE);

        supplierService.updateSupplierHasStatusUpdate(supplierId, StatusUpdateEnum.SIMPLE);

        // Then
        verify(supplierRepositoryMock, times(1)).updateSupplierHasStatusUpdate(supplierId, StatusUpdateEnum.SIMPLE);
    }

    @Test
    @SneakyThrows
    void GivenValidData_WhenUpdateupdateSupplierStatus_ThenExpectRepostitorySaveToBeCalled() {
        // Given
        Supplier supplierData = Supplier.builder().build();
        // When
        when(supplierRepositoryMock.save(supplierData)).thenReturn(supplierData);

        supplierService.updateSupplierStatus(supplierData, SupplierStatusEnum.APPROVED);

        // Then
        assertEquals(StatusUpdateEnum.SIMPLE, supplierData.getStatusUpdate());
        verify(supplierRepositoryMock, times(1)).save(supplierData);
    }

    @Test
    void GivenNotExistingSupplierId_WhenRejectSupplier_ThenExpectDtoValidateException() {
        //Given
        RejectSupplierDto rejectSupplierDto = new RejectSupplierDto(
                RejectionReason.DUPLICATE,
                "",
                SUPPLIER_ID
        );

        // When Then
        assertThrows(DtoValidateNotFoundException.class, () ->
                supplierService.rejectSupplier(rejectSupplierDto, "en-Us"));
    }

    @Test
    void GivenNotExistingSupplierId_WhenGetRejectedSupplier_ThenExpectDtoValidateException() {
        // Given
        when(principalService.getUser()).thenReturn(User.builder().build());

        // When Then
        assertThrows(DtoValidateNotFoundException.class, () ->
                supplierService.getRejectedSupplier(SUPPLIER_ID));
    }

    @Test
    @SneakyThrows
    void GivenValidRequest_WhenRejectSupplier_ThenExpectSavingRejectSupplier() {
        //Given
        RejectSupplierDto rejectSupplierDto = new RejectSupplierDto(
                RejectionReason.DUPLICATE,
                "",
                SUPPLIER_ID
        );
        Tenant mockedTenand = Tenant.builder().name("TestTenant").build();
        Supplier mockedSupplier = Supplier.builder().tenant(mockedTenand).build();

        final List<User> userList = new ArrayList<>();
        userList.add(user);

        //When
        tenant.setId(TENANT_ID);
        supplier.setTenant(tenant);
        when(principalService.getTenantId()).thenReturn(TENANT_ID);
        when(rejectSupplierRepository.save(any(RejectSupplier.class))).thenReturn(mock(RejectSupplier.class));
        when(supplierService.findBySupplierId(any())).thenReturn(Optional.of(supplier));
        when(tenantRepository.findById(any())).thenReturn(Optional.of(tenant));
        when(userServiceMock.findAllSuppliersBySupplierId(mockedSupplier.getId())).thenReturn(userList);
        when(messageSource.getMessage(
                eq("rejection.duplicate"),
                isNull(),
                any(Locale.class)
        )).thenReturn("Duplicate supplier");

        // Then
        supplierService.rejectSupplier(rejectSupplierDto, "en-Us");

        verify(rejectSupplierRepository).save(argThat(
                rejectSupplier -> Objects.equals(rejectSupplier.getReason(), rejectSupplierDto.reason())
                        && Objects.equals(rejectSupplier.getComments(), rejectSupplierDto.comments())
        ));
    }

    @Test
    @SneakyThrows
    void GivenSupplierId_WhenGetQRImage_ThenExpectSuccess() {
        // Given
        User mockUser = mock(User.class);
        UUID uuid = UUID.randomUUID();
        Supplier mockSupplier = mock(Supplier.class);
        when(mockUser.getSupplier()).thenReturn(mockSupplier);
        when(mockSupplier.getId()).thenReturn(uuid);

        byte[] expectedBytes = new byte[]{(byte) 0x89, (byte) 0x50, (byte) 0x4E, (byte) 0x47, (byte) 0x0D, (byte) 0x0A,
                (byte) 0x1A, (byte) 0x0A, (byte) 0x00, (byte) 0x00, (byte) 0x00, (byte) 0x49, (byte) 0x45, (byte) 0x4E,
                (byte) 0x44, (byte) 0xAE, (byte) 0x42, (byte) 0x60, (byte) 0x82};

        S3Object s3Object = new S3Object();
        s3Object.setObjectContent(new ByteArrayInputStream(expectedBytes));

        // When
        when(principalService.getUser()).thenReturn(mockUser);
        when(amazonS3Client.getObject(any(GetObjectRequest.class))).thenReturn(s3Object);

        byte[] actualBytes = supplierService.getQRImage();

        // Then
        assertNotNull(actualBytes);

    }

//    @Test
//    void GivenValidSupplierIdAndException_WhenApproveSupplier_ThenExpectDtoValidateException() throws Exception {
//        //Given
//        Tenant mockedTenand = Tenant.builder().name("TestTenant").build();
//        Supplier mockedSupplier = Supplier.builder().tenant(mockedTenand).build();
//        mockedSupplier.setId(SUPPLIER_ID);
//
//        //When
//        when(supplierService.findBySupplierId(SUPPLIER_ID)).thenReturn(Optional.of(mockedSupplier));
//        when(qrCodeGenerator.generateQRCodeImage("https://www.google.com/")).thenThrow(Exception.class);
//
//        //Then
//        assertThrows(DtoValidateException.class, () ->
//                supplierService.approveSupplier(SUPPLIER_ID, "en-Us"));
//    }

    @Test
    void testGetAllByTenantIdForMap_TenantNotFound() {
        // When & Then
        assertThrows(DtoValidateNotFoundException.class, () -> {
            supplierService.getAllByTenantIdForMap(TENANT_ID);
        });
    }

    @Test
    void testGetAllByTenantIdForMap_NoSuppliers() throws DtoValidateNotFoundException {
        // Given
        when(principalService.getTenantId()).thenReturn(TENANT_ID);
        when(tenantRepository.findById(TENANT_ID)).thenReturn(Optional.of(tenant));
        when(supplierRepositoryMock.findAllByTenantIdAndStatus(TENANT_ID, SupplierStatusEnum.APPROVED))
                .thenReturn(List.of());

        // When
        List<SupplierForMapViewDto> result = supplierService.getAllByTenantIdForMap(TENANT_ID);

        // Then
        assertEquals(0, result.size());
    }

    @Test
    void testTnGetAllByTenantIdForMap_SuppliersFound() throws DtoValidateNotFoundException {
        // Given
        supplier.setProfile(new SupplierProfile());
        when(principalService.getTenantId()).thenReturn(TENANT_ID);
        when(tenantRepository.findById(TENANT_ID)).thenReturn(Optional.of(tenant));
        when(supplierRepositoryMock.findAllByTenantIdAndStatus(TENANT_ID, SupplierStatusEnum.APPROVED))
                .thenReturn(List.of(supplier));

        SupplierForMapViewDto expectedDto = SupplierForMapViewDto.entityToSupplierForMapViewDto(supplier);

        // When
        List<SupplierForMapViewDto> result = supplierService.getAllByTenantIdForMap(TENANT_ID);

        // Then
        assertEquals(1, result.size());
        assertEquals(expectedDto, result.get(0));
    }

    @Test
    void GivenInvalidSupplierId_WhenFinalizeSupplier_ThenExpectDtoValidateNotFoundException() {
        // Given
        SupplierRequestPatchDto invalidSupplier = createSupplierRequestPatchDto(null, UUID.randomUUID(), "");
        when(supplierRepositoryMock.findById(any())).thenReturn(Optional.empty());

        // When & Then
        assertThrows(DtoValidateNotFoundException.class, () -> {
            supplierService.finalizeSupplier(invalidSupplier, "en-Us");
        });
    }

    @Test
    void GivenApprovedSupplier_WhenFinalizeSupplier_ThenExpectDtoValidateException() {
        // Given
        SupplierRequestPatchDto supplierRequestPatchDto = createSupplierRequestPatchDto(null, SUPPLIER_ID, "");

        Supplier existingSupplier = Supplier.builder()
                .status(SupplierStatusEnum.APPROVED)
                .build();

        when(supplierRepositoryMock.findById(any())).thenReturn(Optional.of(existingSupplier));

        // When & Then
        assertThrows(DtoValidateException.class, () -> {
            supplierService.finalizeSupplier(supplierRequestPatchDto, "en-Us");
        });
    }

    @Test
    void GivenValidSupplierRequestPatchDto_WhenFinalizeSupplier_ThenExpectSuccess() throws DtoValidateException {
        // Given
        String adminEmail = "admin@example.com";

        SupplierProfilePatchDto supplierProfilePatchDto = createSupplierProfilePatchDto();
        SupplierRequestPatchDto supplierRequestPatchDto = createSupplierRequestPatchDto(supplierProfilePatchDto, SUPPLIER_ID, adminEmail);

        tenant.setId(TENANT_ID);

        supplier.setTenant(tenant);
        supplier.setAdminEmail(adminEmail);
        supplier.setIsProfileSet(true);
        supplier.setWorkingHours(List.of());

        user.setTenantId(TENANT_ID);
        user.setUsername(adminEmail);

        Role superAdminRole = new Role();
        superAdminRole.setName(Role.ROLE_SUPER_ADMIN);

        user.setRole(superAdminRole);

        User superAdminUser = User.builder().role(superAdminRole).tenantId(TENANT_ID).build();
        when(principalService.getUser()).thenReturn(superAdminUser);

        when(supplierRepositoryMock.findById(any())).thenReturn(Optional.of(supplier));
        when(userServiceMock.findByUsername(adminEmail)).thenReturn(Optional.of(user));
        doNothing().when(supplierProfileService).saveUpdatedData(supplier, supplierProfilePatchDto);
        when(workingHoursService.editAll(any(), any())).thenReturn(List.of());
        when(supplierProfileService.getCashierEmailResultDto(any(), any())).thenReturn(new CashierEmailResultDto(Set.of(), Set.of()));

        when(javers.compare(any(), any())).thenReturn(diff);
        when(diff.getChanges()).thenReturn(changes);
        doReturn(Stream.empty()).when(changes).stream();

        // When
        supplierService.finalizeSupplier(supplierRequestPatchDto, "en-Us");

        // Then
        verify(supplierProfileService, times(1)).saveUpdatedData(supplier, supplierProfilePatchDto);
        verify(workingHoursService, times(1)).editAll(any(), any());
    }

    @Test
    void GivenInvalidAdminEmail_WhenFinalizeSupplier_ThenExpectDtoValidateNotFoundException() {
        // Given
        SupplierRequestPatchDto supplierRequestPatchDto = createSupplierRequestPatchDto(null, SUPPLIER_ID, "invalid");

        when(supplierRepositoryMock.findById(any())).thenReturn(Optional.of(supplier));
        when(userServiceMock.findByUsername(any())).thenReturn(Optional.empty());

        // When & Then
        assertThrows(DtoValidateNotFoundException.class, () -> {
            supplierService.finalizeSupplier(supplierRequestPatchDto, "en-Us");
        });
    }

    @Test
    void GivenNewAdminEmail_WhenFinalizeSupplier_ThenExpectSuccess() throws DtoValidateException {
        // Given
        String oldAdminEmail = "oldEmail@example.com";
        String newAdminEmail = "newEmail@example.com";

        SupplierProfilePatchDto supplierProfilePatchDto = createSupplierProfilePatchDto();

        SupplierRequestPatchDto supplierRequestPatchDto = createSupplierRequestPatchDto(supplierProfilePatchDto, SUPPLIER_ID, newAdminEmail);

        tenant.setId(TENANT_ID);
        supplier.setTenant(tenant);
        supplier.setAdminEmail(oldAdminEmail);
        supplier.setIsProfileSet(true);
        supplier.setWorkingHours(List.of());
        user.setTenantId(TENANT_ID);
        user.setUsername(oldAdminEmail);

        Role superAdminRole = new Role();
        superAdminRole.setName(Role.ROLE_SUPER_ADMIN);
        user.setRole(superAdminRole);

        User superAdminUser = User.builder().role(superAdminRole).tenantId(TENANT_ID).build();
        when(principalService.getUser()).thenReturn(superAdminUser);
        when(supplierRepositoryMock.findById(any())).thenReturn(Optional.of(supplier));
        when(userServiceMock.findByUsername(oldAdminEmail)).thenReturn(Optional.of(user));
        doNothing().when(supplierProfileService).saveUpdatedData(supplier, supplierProfilePatchDto);
        when(workingHoursService.editAll(any(), any())).thenReturn(List.of());
        when(supplierProfileService.getCashierEmailResultDto(any(), any())).thenReturn(new CashierEmailResultDto(Set.of(), Set.of()));

        when(javers.compare(any(), any())).thenReturn(diff);
        when(diff.getChanges()).thenReturn(changes);
        doReturn(Stream.empty()).when(changes).stream();

        supplierService.finalizeSupplier(supplierRequestPatchDto, "en-Us");

        // Then
        verify(userServiceMock, times(1)).save(argThat(updatedUser ->
                Objects.equals(updatedUser.getUsername(), newAdminEmail) &&
                        Objects.equals(updatedUser.getTenantId(), TENANT_ID)
        ));
    }

    @Test
    @SneakyThrows
    void GivenValidSupplierId_WhenValidateSupplier_ThenExpectSuccess() {
        // Given
        Role supplierRole = new Role();
        supplierRole.setName(Role.ROLE_SUPPLIER);
        supplier.setId(SUPPLIER_ID);
        User supplierUser = User.builder().role(supplierRole).supplier(supplier).build();
        when(principalService.getUser()).thenReturn(supplierUser);
        when(supplierRepositoryMock.findWithSupplierProfileById(SUPPLIER_ID)).thenReturn(Optional.of(supplier));

        // When
        supplierService.validateSupplier(SUPPLIER_ID);

        // Then
        verify(supplierRepositoryMock, times(1)).findWithSupplierProfileById(SUPPLIER_ID);
    }

    @Test
    void GivenNotFoundSupplier_WhenGetSupplierWithProfile_ThenExpectNotFoundException() {
        // Given
        Role adminRole = new Role();
        adminRole.setName(Role.ROLE_SUPER_ADMIN);
        User currentUser = User.builder().role(adminRole).tenantId(TENANT_ID).build();
        when(principalService.getUser()).thenReturn(currentUser);
        when(supplierRepositoryMock.findWithSupplierProfileById(SUPPLIER_ID)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(NotFoundException.class, () -> supplierService.getSupplierWithProfile(SUPPLIER_ID));
    }

    @Test
    @SneakyThrows
    void GivenSupplierRoleAccessingOwnSupplier_WhenGetSupplierWithProfile_ThenExpectSuccess() {
        // Given
        supplier.setId(SUPPLIER_ID);
        tenant.setId(TENANT_ID);
        supplier.setTenant(tenant);
        Role supplierRole = new Role();
        supplierRole.setName(Role.ROLE_SUPPLIER);
        Supplier ownSupplier = new Supplier();
        ownSupplier.setId(SUPPLIER_ID);
        User currentUser = User.builder().role(supplierRole).supplier(ownSupplier).build();
        when(principalService.getUser()).thenReturn(currentUser);
        when(supplierRepositoryMock.findWithSupplierProfileById(SUPPLIER_ID)).thenReturn(Optional.of(supplier));

        // When
        Supplier result = supplierService.getSupplierWithProfile(SUPPLIER_ID);

        // Then
        assertNotNull(result);
    }

    @Test
    void GivenSupplierRoleAccessingDifferentSupplier_WhenGetSupplierWithProfile_ThenExpectUnauthorizedActionException() {
        // Given
        supplier.setId(SUPPLIER_ID);
        tenant.setId(TENANT_ID);
        supplier.setTenant(tenant);
        Role supplierRole = new Role();
        supplierRole.setName(Role.ROLE_SUPPLIER);
        Supplier differentSupplier = new Supplier();
        differentSupplier.setId(UUID.randomUUID());
        User currentUser = User.builder().role(supplierRole).supplier(differentSupplier).build();
        when(principalService.getUser()).thenReturn(currentUser);
        when(supplierRepositoryMock.findWithSupplierProfileById(SUPPLIER_ID)).thenReturn(Optional.of(supplier));

        // When & Then
        assertThrows(UnauthorizedActionException.class, () -> supplierService.getSupplierWithProfile(SUPPLIER_ID));
    }

    @Test
    void GivenAdminFromDifferentTenant_WhenGetSupplierWithProfile_ThenExpectUnauthorizedActionException() {
        // Given
        UUID differentTenantId = UUID.randomUUID();
        Tenant supplierTenant = new Tenant();
        supplierTenant.setId(TENANT_ID);
        supplier.setId(SUPPLIER_ID);
        supplier.setTenant(supplierTenant);
        Role adminRole = new Role();
        adminRole.setName(Role.ROLE_SUPER_ADMIN);
        User currentUser = User.builder().role(adminRole).tenantId(differentTenantId).build();
        when(principalService.getUser()).thenReturn(currentUser);
        when(supplierRepositoryMock.findWithSupplierProfileById(SUPPLIER_ID)).thenReturn(Optional.of(supplier));

        // When & Then
        assertThrows(UnauthorizedActionException.class, () -> supplierService.getSupplierWithProfile(SUPPLIER_ID));
    }

    @Test
    @SneakyThrows
    void GivenAdminFromSameTenant_WhenGetSupplierWithProfile_ThenExpectSuccess() {
        // Given
        Tenant supplierTenant = new Tenant();
        supplierTenant.setId(TENANT_ID);
        supplier.setId(SUPPLIER_ID);
        supplier.setTenant(supplierTenant);
        Role adminRole = new Role();
        adminRole.setName(Role.ROLE_SUPER_ADMIN);
        User currentUser = User.builder().role(adminRole).tenantId(TENANT_ID).build();
        when(principalService.getUser()).thenReturn(currentUser);
        when(supplierRepositoryMock.findWithSupplierProfileById(SUPPLIER_ID)).thenReturn(Optional.of(supplier));

        // When
        Supplier result = supplierService.getSupplierWithProfile(SUPPLIER_ID);

        // Then
        assertNotNull(result);
    }

    @Test
    void GivenNonExistentSupplierId_WhenGetSupplierAndValidateOnPrincipal_ThenExpectDtoValidateNotFoundException() {
        // Given
        when(supplierRepositoryMock.findWithSupplierProfileById(SUPPLIER_ID)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(DtoValidateNotFoundException.class,
                () -> supplierService.getSupplierAndValidateOnPrincipal(SUPPLIER_ID));
    }

    @Test
    void GivenUserWithNullSupplier_WhenGetSupplierAndValidateOnPrincipal_ThenExpectDtoValidateNotFoundException() {
        // Given
        Supplier mockedSupplier = Supplier.builder().build();
        mockedSupplier.setId(SUPPLIER_ID);
        User userWithoutSupplier = User.builder().build();

        when(supplierRepositoryMock.findWithSupplierProfileById(SUPPLIER_ID)).thenReturn(Optional.of(mockedSupplier));
        when(principalService.getUser()).thenReturn(userWithoutSupplier);

        // When & Then
        assertThrows(DtoValidateNotFoundException.class,
                () -> supplierService.getSupplierAndValidateOnPrincipal(SUPPLIER_ID));
    }

    @Test
    void GivenUserWithDifferentSupplier_WhenGetSupplierAndValidateOnPrincipal_ThenExpectDtoValidateNotFoundException() {
        // Given
        Supplier mockedSupplier = Supplier.builder().build();
        mockedSupplier.setId(SUPPLIER_ID);
        Supplier differentSupplier = Supplier.builder().build();
        differentSupplier.setId(UUID.randomUUID());

        User userWithDifferentSupplier = User.builder().supplier(differentSupplier).build();

        when(supplierRepositoryMock.findWithSupplierProfileById(SUPPLIER_ID)).thenReturn(Optional.of(mockedSupplier));
        when(principalService.getUser()).thenReturn(userWithDifferentSupplier);

        // When & Then
        assertThrows(DtoValidateNotFoundException.class,
                () -> supplierService.getSupplierAndValidateOnPrincipal(SUPPLIER_ID));
    }

    @Test
    void GivenMatchingPrincipalSupplier_WhenGetSupplierAndValidateOnPrincipal_ThenExpectSupplierReturned() throws Exception {
        // Given
        Supplier mockedSupplier = Supplier.builder().build();
        mockedSupplier.setId(SUPPLIER_ID);
        User userWithMatchingSupplier = User.builder().supplier(mockedSupplier).build();

        when(supplierRepositoryMock.findWithSupplierProfileById(SUPPLIER_ID)).thenReturn(Optional.of(mockedSupplier));
        when(principalService.getUser()).thenReturn(userWithMatchingSupplier);

        // When
        Supplier result = supplierService.getSupplierAndValidateOnPrincipal(SUPPLIER_ID);

        // Then
        assertNotNull(result);
        assertEquals(SUPPLIER_ID, result.getId());
    }

    @Test
    void GivenNonExistentSupplierId_WhenGetSupplierAndValidateOnTenant_ThenExpectDtoValidateNotFoundException() {
        // Given
        when(supplierRepositoryMock.findWithSupplierProfileById(SUPPLIER_ID)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(DtoValidateNotFoundException.class,
                () -> supplierService.getSupplierAndValidateOnTenant(SUPPLIER_ID));
    }

    @Test
    void GivenSupplierWithNullTenant_WhenGetSupplierAndValidateOnTenant_ThenExpectDtoValidateNotFoundException() {
        // Given
        Supplier mockedSupplier = Supplier.builder().build();
        mockedSupplier.setId(SUPPLIER_ID);
        User mockUser = User.builder().tenantId(TENANT_ID).build();

        when(supplierRepositoryMock.findWithSupplierProfileById(SUPPLIER_ID)).thenReturn(Optional.of(mockedSupplier));
        when(principalService.getUser()).thenReturn(mockUser);

        // When & Then
        assertThrows(DtoValidateNotFoundException.class,
                () -> supplierService.getSupplierAndValidateOnTenant(SUPPLIER_ID));
    }

    @Test
    void GivenSupplierWithDifferentTenantId_WhenGetSupplierAndValidateOnTenant_ThenExpectDtoValidateNotFoundException() {
        // Given
        Tenant differentTenant = new Tenant();
        differentTenant.setId(UUID.randomUUID());
        Supplier mockedSupplier = Supplier.builder().tenant(differentTenant).build();
        mockedSupplier.setId(SUPPLIER_ID);
        User mockUser = User.builder().tenantId(TENANT_ID).build();

        when(supplierRepositoryMock.findWithSupplierProfileById(SUPPLIER_ID)).thenReturn(Optional.of(mockedSupplier));
        when(principalService.getUser()).thenReturn(mockUser);

        // When & Then
        assertThrows(DtoValidateNotFoundException.class,
                () -> supplierService.getSupplierAndValidateOnTenant(SUPPLIER_ID));
    }

    @Test
    void GivenMatchingTenantId_WhenGetSupplierAndValidateOnTenant_ThenExpectSupplierReturned() throws Exception {
        // Given
        Tenant matchingTenant = new Tenant();
        matchingTenant.setId(TENANT_ID);
        Supplier mockedSupplier = Supplier.builder().tenant(matchingTenant).build();
        mockedSupplier.setId(SUPPLIER_ID);
        User mockUser = User.builder().tenantId(TENANT_ID).build();

        when(supplierRepositoryMock.findWithSupplierProfileById(SUPPLIER_ID)).thenReturn(Optional.of(mockedSupplier));
        when(principalService.getUser()).thenReturn(mockUser);

        // When
        Supplier result = supplierService.getSupplierAndValidateOnTenant(SUPPLIER_ID);

        // Then
        assertNotNull(result);
        assertEquals(SUPPLIER_ID, result.getId());
    }

    // ===== New security tests for getRejectedSupplier =====

    @Test
    void GivenUserSupplierIdMismatch_WhenGetRejectedSupplier_ThenExpectDtoValidateNotFoundException() {
        // Given
        Supplier differentSupplier = new Supplier();
        differentSupplier.setId(UUID.randomUUID());
        User userWithDifferentSupplier = User.builder().supplier(differentSupplier).build();
        when(principalService.getUser()).thenReturn(userWithDifferentSupplier);

        // When & Then
        assertThrows(DtoValidateNotFoundException.class, () ->
                supplierService.getRejectedSupplier(SUPPLIER_ID));
    }

    @Test
    @SneakyThrows
    void GivenMatchingPrincipal_WhenGetRejectedSupplier_ThenExpectDto() {
        // Given
        Supplier ownSupplier = new Supplier();
        ownSupplier.setId(SUPPLIER_ID);
        User supplierUser = User.builder().supplier(ownSupplier).build();
        RejectSupplier rejectSupplier = new RejectSupplier(UUID.randomUUID(), RejectionReason.DUPLICATE, "", ownSupplier);
        when(principalService.getUser()).thenReturn(supplierUser);
        when(rejectSupplierRepository.findBySupplierId(SUPPLIER_ID)).thenReturn(Optional.of(rejectSupplier));

        // When
        RejectSupplierDto result = supplierService.getRejectedSupplier(SUPPLIER_ID);

        // Then
        assertNotNull(result);
    }

    // ===== New security tests for clearStatusUpdate =====

    @Test
    void GivenUserSupplierIdMismatch_WhenClearStatusUpdate_ThenExpectDtoValidateNotFoundException() {
        // Given
        Supplier differentSupplier = new Supplier();
        differentSupplier.setId(UUID.randomUUID());
        User userWithDifferentSupplier = User.builder().supplier(differentSupplier).build();
        when(principalService.getUser()).thenReturn(userWithDifferentSupplier);

        // When & Then
        assertThrows(DtoValidateNotFoundException.class, () ->
                supplierService.clearStatusUpdate(SUPPLIER_ID));
    }

    @Test
    @SneakyThrows
    void GivenMatchingPrincipal_WhenClearStatusUpdate_ThenExpectRepositoryCall() {
        // Given
        Supplier ownSupplier = new Supplier();
        ownSupplier.setId(SUPPLIER_ID);
        User supplierUser = User.builder().supplier(ownSupplier).build();
        when(principalService.getUser()).thenReturn(supplierUser);
        when(supplierRepositoryMock.findWithSupplierProfileById(SUPPLIER_ID)).thenReturn(Optional.of(ownSupplier));

        // When
        supplierService.clearStatusUpdate(SUPPLIER_ID);

        // Then
        verify(supplierRepositoryMock, times(1)).clearSupplierStatusUpdate(SUPPLIER_ID);
    }

    // ===== New security tests for validateSupplier (role-aware) =====

    @Test
    void GivenSupplierRoleWithDifferentId_WhenValidateSupplier_ThenExpectNotFoundException() {
        // Given
        Role supplierRole = new Role();
        supplierRole.setName(Role.ROLE_SUPPLIER);
        Supplier differentSupplier = new Supplier();
        differentSupplier.setId(UUID.randomUUID());
        User supplierUser = User.builder().role(supplierRole).supplier(differentSupplier).build();
        when(principalService.getUser()).thenReturn(supplierUser);
        when(supplierRepositoryMock.findWithSupplierProfileById(SUPPLIER_ID)).thenReturn(Optional.of(supplier));

        // When & Then
        assertThrows(DtoValidateNotFoundException.class, () ->
                supplierService.validateSupplier(SUPPLIER_ID));
    }

    @Test
    @SneakyThrows
    void GivenAdminRoleWithSameTenant_WhenValidateSupplier_ThenExpectSuccess() {
        // Given
        Role adminRole = new Role();
        adminRole.setName(Role.ROLE_MUNICIPALITY_ADMIN);
        tenant.setId(TENANT_ID);
        supplier.setTenant(tenant);
        User adminUser = User.builder().role(adminRole).tenantId(TENANT_ID).build();
        when(principalService.getUser()).thenReturn(adminUser);
        when(supplierRepositoryMock.findWithSupplierProfileById(SUPPLIER_ID)).thenReturn(Optional.of(supplier));

        // When
        supplierService.validateSupplier(SUPPLIER_ID);

        // Then
        verify(supplierRepositoryMock, times(1)).findWithSupplierProfileById(SUPPLIER_ID);
    }

    @Test
    void GivenAdminRoleWithDifferentTenant_WhenValidateSupplier_ThenExpectNotFoundException() {
        // Given
        Role adminRole = new Role();
        adminRole.setName(Role.ROLE_MUNICIPALITY_ADMIN);
        Tenant differentTenant = new Tenant();
        differentTenant.setId(UUID.randomUUID());
        supplier.setTenant(differentTenant);
        User adminUser = User.builder().role(adminRole).tenantId(TENANT_ID).build();
        when(principalService.getUser()).thenReturn(adminUser);
        when(supplierRepositoryMock.findWithSupplierProfileById(SUPPLIER_ID)).thenReturn(Optional.of(supplier));

        // When & Then
        assertThrows(DtoValidateNotFoundException.class, () ->
                supplierService.validateSupplier(SUPPLIER_ID));
    }

    // ===== New security tests for getSupplierAndValidateOnPrincipalOrSuperAdmin =====

    @Test
    void GivenSupplierNotFound_WhenGetSupplierAndValidateOnPrincipalOrSuperAdmin_ThenExpectNotFoundException() {
        // Given
        when(supplierRepositoryMock.findWithSupplierProfileById(SUPPLIER_ID)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(DtoValidateNotFoundException.class, () ->
                supplierService.getSupplierAndValidateOnPrincipalOrSuperAdmin(SUPPLIER_ID));
    }

    @Test
    @SneakyThrows
    void GivenSuperAdminRole_WhenGetSupplierAndValidateOnPrincipalOrSuperAdmin_ThenExpectSuccess() {
        // Given
        Role superAdminRole = new Role();
        superAdminRole.setName(Role.ROLE_SUPER_ADMIN);
        User superAdmin = User.builder().role(superAdminRole).build();
        supplier.setId(SUPPLIER_ID);
        when(principalService.getUser()).thenReturn(superAdmin);
        when(supplierRepositoryMock.findWithSupplierProfileById(SUPPLIER_ID)).thenReturn(Optional.of(supplier));

        // When
        Supplier result = supplierService.getSupplierAndValidateOnPrincipalOrSuperAdmin(SUPPLIER_ID);

        // Then
        assertNotNull(result);
        assertEquals(SUPPLIER_ID, result.getId());
    }

    @Test
    @SneakyThrows
    void GivenSupplierRoleMatchingId_WhenGetSupplierAndValidateOnPrincipalOrSuperAdmin_ThenExpectSuccess() {
        // Given
        Role supplierRole = new Role();
        supplierRole.setName(Role.ROLE_SUPPLIER);
        supplier.setId(SUPPLIER_ID);
        User supplierUser = User.builder().role(supplierRole).supplier(supplier).build();
        when(principalService.getUser()).thenReturn(supplierUser);
        when(supplierRepositoryMock.findWithSupplierProfileById(SUPPLIER_ID)).thenReturn(Optional.of(supplier));

        // When
        Supplier result = supplierService.getSupplierAndValidateOnPrincipalOrSuperAdmin(SUPPLIER_ID);

        // Then
        assertNotNull(result);
        assertEquals(SUPPLIER_ID, result.getId());
    }

    @Test
    void GivenSupplierRoleWithDifferentId_WhenGetSupplierAndValidateOnPrincipalOrSuperAdmin_ThenExpectNotFoundException() {
        // Given
        Role supplierRole = new Role();
        supplierRole.setName(Role.ROLE_SUPPLIER);
        Supplier differentSupplier = new Supplier();
        differentSupplier.setId(UUID.randomUUID());
        User supplierUser = User.builder().role(supplierRole).supplier(differentSupplier).build();
        supplier.setId(SUPPLIER_ID);
        when(principalService.getUser()).thenReturn(supplierUser);
        when(supplierRepositoryMock.findWithSupplierProfileById(SUPPLIER_ID)).thenReturn(Optional.of(supplier));

        // When & Then
        assertThrows(DtoValidateNotFoundException.class, () ->
                supplierService.getSupplierAndValidateOnPrincipalOrSuperAdmin(SUPPLIER_ID));
    }

    // ===== New security tests for approveSupplier and rejectSupplier cross-tenant =====

    @Test
    void GivenAdminFromDifferentTenant_WhenApproveSupplier_ThenExpectDtoValidateNotFoundException() {
        // Given
        Tenant supplierTenant = new Tenant();
        supplierTenant.setId(UUID.randomUUID());
        supplier.setTenant(supplierTenant);
        when(supplierRepositoryMock.findWithSupplierProfileById(SUPPLIER_ID)).thenReturn(Optional.of(supplier));
        when(principalService.getTenantId()).thenReturn(TENANT_ID);

        // When & Then
        assertThrows(DtoValidateNotFoundException.class, () ->
                supplierService.approveSupplier(SUPPLIER_ID, "en-US"));
    }

    @Test
    void GivenAdminFromDifferentTenant_WhenRejectSupplier_ThenExpectDtoValidateNotFoundException() {
        // Given
        RejectSupplierDto rejectSupplierDto = new RejectSupplierDto(RejectionReason.DUPLICATE, "", SUPPLIER_ID);
        Tenant supplierTenant = new Tenant();
        supplierTenant.setId(UUID.randomUUID());
        supplier.setTenant(supplierTenant);
        when(supplierRepositoryMock.findWithSupplierProfileById(SUPPLIER_ID)).thenReturn(Optional.of(supplier));
        when(principalService.getTenantId()).thenReturn(TENANT_ID);

        // When & Then
        assertThrows(DtoValidateNotFoundException.class, () ->
                supplierService.rejectSupplier(rejectSupplierDto, "en-US"));
    }

    // ===== New security tests for enforceAdminTenantIdOwnership =====

    @Test
    void GivenAdminFromDifferentTenantId_WhenGetAllByTenantIdAndStatus_ThenExpectDtoValidateException() {
        // Given - principal has different tenantId than requested
        when(principalService.getTenantId()).thenReturn(UUID.randomUUID());

        // When & Then
        assertThrows(DtoValidateException.class, () ->
                supplierService.getAllByTenantIdAndStatus(TENANT_ID, 0, 25, SupplierStatusEnum.APPROVED));
    }

    @Test
    void GivenAdminFromDifferentTenantId_WhenGetAllByTenantIdAndStatusIn_ThenExpectDtoValidateException() {
        // Given
        when(principalService.getTenantId()).thenReturn(UUID.randomUUID());

        // When & Then
        assertThrows(DtoValidateException.class, () ->
                supplierService.getAllByTenantIdAndStatusIn(TENANT_ID, 0, 25, Set.of(SupplierStatusEnum.PENDING)));
    }

    @Test
    void GivenAdminFromDifferentTenantId_WhenGetAllByTenantIdForMap_ThenExpectDtoValidateNotFoundException() {
        // Given
        when(principalService.getTenantId()).thenReturn(UUID.randomUUID());

        // When & Then
        assertThrows(DtoValidateNotFoundException.class, () ->
                supplierService.getAllByTenantIdForMap(TENANT_ID));
    }

    @Test
    void GivenAdminFromDifferentTenantId_WhenCountAllByTenantIdAndStatus_ThenExpectDtoValidateNotFoundException() {
        // Given
        when(principalService.getTenantId()).thenReturn(UUID.randomUUID());

        // When & Then
        assertThrows(DtoValidateNotFoundException.class, () ->
                supplierService.countAllByTenantIdAndStatus(TENANT_ID, Set.of(SupplierStatusEnum.APPROVED)));
    }


    private SupplierProfilePatchDto createSupplierProfilePatchDto() {
        LatLonDto latLonDto = new LatLonDto(52.3676, 4.9041);
        return SupplierProfilePatchDto.builder()
                .ownerName("Test owner")
                .legalForm(1)
                .group(1)
                .category(1)
                .subcategory(1)
                .iban("NL55ABNA5660751954")
                .companyBranchAddress("Test address")
                .branchZip("1234AB")
                .branchLocation("Test location")
                .email("contact@email.com")
                .supplierId(SUPPLIER_ID)
                .latlon(latLonDto)
                .build();
    }

    private SupplierRequestPatchDto createSupplierRequestPatchDto(SupplierProfilePatchDto profile, UUID supplierId, String adminEmail) {
        return SupplierRequestPatchDto.builder()
                .supplierId(supplierId)
                .kvkNumber("12345678")
                .profile(profile)
                .adminEmail(adminEmail)
                .build();
    }
}
