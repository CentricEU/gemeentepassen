package nl.centric.innovation.local4local.unit;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.GetObjectRequest;
import com.amazonaws.services.s3.model.S3Object;
import lombok.SneakyThrows;
import nl.centric.innovation.local4local.dto.RegisterSupplierDto;
import nl.centric.innovation.local4local.dto.RejectSupplierDto;
import nl.centric.innovation.local4local.dto.SupplierForMapViewDto;
import nl.centric.innovation.local4local.dto.SupplierViewDto;
import nl.centric.innovation.local4local.entity.RejectSupplier;
import nl.centric.innovation.local4local.entity.Supplier;
import nl.centric.innovation.local4local.entity.SupplierProfile;
import nl.centric.innovation.local4local.entity.Tenant;
import nl.centric.innovation.local4local.entity.User;
import nl.centric.innovation.local4local.enums.RejectionReason;
import nl.centric.innovation.local4local.enums.SupplierStatusEnum;
import nl.centric.innovation.local4local.exceptions.DtoValidateAlreadyExistsException;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.repository.RejectSupplierRepository;
import nl.centric.innovation.local4local.repository.SupplierRepository;
import nl.centric.innovation.local4local.repository.TenantRepository;
import nl.centric.innovation.local4local.service.impl.PrincipalService;
import nl.centric.innovation.local4local.service.impl.SupplierService;
import nl.centric.innovation.local4local.service.impl.UserService;
import nl.centric.innovation.local4local.service.interfaces.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
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
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Stream;

import static nl.centric.innovation.local4local.service.impl.SupplierService.ORDER_CRITERIA;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.doNothing;
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
        when(tenantRepository.findById(TENANT_ID)).thenReturn(Optional.of(tenant1));
        when(supplierRepositoryMock.findAllByTenantIdAndStatusIn(TENANT_ID, PageRequest.of(0, 25, Sort.by(ORDER_CRITERIA)), statusSet))
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
        when(tenantRepository.findById(TENANT_ID)).thenReturn(Optional.of(tenant));
        when(supplierRepositoryMock.countByTenantIdAndStatusIn(TENANT_ID, Set.of(SupplierStatusEnum.APPROVED))).thenReturn(2);

        Integer count = supplierService.countAllByTenantIdAndStatus(TENANT_ID, Set.of(SupplierStatusEnum.APPROVED));

        assertEquals(2, count);
    }

    @Test
    void GivenNotExistingTenantId_WhenCountSuppliers_ThenExpectDtoValidateException() {
        when(tenantRepository.findById(TENANT_ID)).thenReturn(Optional.empty());

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

        doNothing().when(supplierRepositoryMock).updateSupplierHasStatusUpdate(supplierId, true);

        supplierService.updateSupplierHasStatusUpdate(supplierId, true);

        // Then
        verify(supplierRepositoryMock, times(1)).updateSupplierHasStatusUpdate(supplierId, true);
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
        assertTrue(supplierData.isHasStatusUpdate());
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
                supplierService.rejectSupplier(rejectSupplierDto, "en-Us", RejectionReason.NOT_IN_REGION.toString()));
    }

    @Test
    void GivenNotExistingSupplierId_WhenGetRejectedSupplier_ThenExpectDtoValidateException() {
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
        when(rejectSupplierRepository.save(any(RejectSupplier.class))).thenReturn(mock(RejectSupplier.class));
        when(supplierService.findBySupplierId(any())).thenReturn(Optional.of(supplier));
        when(tenantRepository.findById(any())).thenReturn(Optional.of(tenant));
        when(userServiceMock.findAllSuppliersBySupplierId(mockedSupplier.getId())).thenReturn(userList);

        // Then
        supplierService.rejectSupplier(rejectSupplierDto, "en-Us", RejectionReason.NOT_IN_REGION.toString());

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
        // Given
        when(tenantRepository.findById(TENANT_ID)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(DtoValidateNotFoundException.class, () -> {
            supplierService.getAllByTenantIdForMap(TENANT_ID);
        });
    }

    @Test
    void testGetAllByTenantIdForMap_NoSuppliers() throws DtoValidateNotFoundException {
        // Given
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
}
