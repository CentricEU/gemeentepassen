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
import nl.centric.innovation.local4local.service.impl.SupplierServiceImpl;
import nl.centric.innovation.local4local.service.impl.UserService;
import nl.centric.innovation.local4local.service.interfaces.EmailService;
import nl.centric.innovation.local4local.service.interfaces.TenantService;
import nl.centric.innovation.local4local.util.ModelConverter;
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

import static nl.centric.innovation.local4local.service.impl.SupplierServiceImpl.ORDER_CRITERIA;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class SupplierServiceImplTests {
    @InjectMocks
    private SupplierServiceImpl supplierService;
    @Mock
    private SupplierRepository supplierRepositoryMock;
    @Mock
    private TenantRepository tenantRepository;
    @Mock
    private RejectSupplierRepository rejectSupplierRepository;
    @Mock
    private TenantService tenantServiceMock;
    @Mock
    private UserService userServiceMock;
    @Mock
    private EmailService emailService;
    @Mock
    private AmazonS3 amazonS3Client;

    @Mock
    private PrincipalService principalService;


    private Tenant tenant;

    private Supplier supplier;
    private User user;

    private RejectSupplier rejectSupplier;
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
        rejectSupplier = new RejectSupplier();
    }

    @ParameterizedTest
    @MethodSource("customKvk")
    @SneakyThrows
    public void GivenValid_WhenSaveSupplier_ThenExpectSuccess(String kvk) {
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
    public void GivenNoTenant_WhenSaveSupplier_ThenExpectDtoValidateNotFoundException() {
        // Given
        RegisterSupplierDto invalidSupplierDto = RegisterSupplierDto.builder().agreedTerms(true).kvk(KVK_VALID).build();

        // When Then
        assertThrows(DtoValidateNotFoundException.class, () -> supplierService.save(invalidSupplierDto, Optional.empty(), "en"));

    }

    @Test
    public void GivenUserWithEmailEmailAlreadyExisting_WhenSaveSupplier_ThenExpectDtoValidateAlreadyExistsException() {
        // Given
        RegisterSupplierDto duplicateEmailSupplierDto = RegisterSupplierDto.builder().agreedTerms(true).kvk(KVK_VALID)
                .build();

        // WHen
        when(userServiceMock.findByUsername(any())).thenReturn(Optional.of(user));

        // Then
        assertThrows(DtoValidateAlreadyExistsException.class, () -> supplierService.save(duplicateEmailSupplierDto, Optional.of(tenant), "nl-NL"));

    }

    @Test
    public void GivenTermsAndConditionNotAgreed_WhenSaveSupplier_ThenExpectDtoValidateException() {
        // Given
        RegisterSupplierDto termsNotAgreedSupplierDto = RegisterSupplierDto.builder().agreedTerms(false).kvk(KVK_VALID)
                .build();

        // When Then
        assertThrows(DtoValidateException.class, () -> supplierService.save(termsNotAgreedSupplierDto, Optional.of(tenant), "nl-NL"));

    }

    @Test
    public void GivenKvkNotValid_WhenSaveSupplier_ThenExpectDtoValidateException() {
        // Given
        RegisterSupplierDto termsNotAgreedSupplierDto = RegisterSupplierDto.builder().agreedTerms(true).kvk("3128")
                .build();

        // When Then
        assertThrows(DtoValidateException.class, () -> supplierService.save(termsNotAgreedSupplierDto, Optional.of(tenant), "nl-NL"));

    }

    @Test
    public void GivenNotExistingTenantId_WhenGetSuppliers_ThenExpectDtoValidateException() {
        // When Then
        assertThrows(DtoValidateException.class,
                () -> supplierService.getAllByTenantIdAndStatus(TENANT_ID, 0, 25, SupplierStatusEnum.APPROVED));
    }

    @Test
    public void GivenNotExistingTenantId_WhenGetSuppliersAndMultipleStatus_ThenExpectDtoValidateException() {
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
    public void GivenValidTenantId_WhenGetAllByTenantId_ThenSuppliersDtosReturned() {
        // Given
        Set<SupplierStatusEnum> statusSet = new HashSet<>();
        statusSet.add(SupplierStatusEnum.PENDING);
        statusSet.add(SupplierStatusEnum.REJECTED);

        Tenant tenant1 = new Tenant();
        tenant1.setId(TENANT_ID);

        List<Supplier> mockSupplierList = List.of(new Supplier(), new Supplier()); // Replace with actual User objects
        Page<Supplier> mockSupplierPage = new PageImpl<>(mockSupplierList);

        // When
        when(tenantServiceMock.findByTenantId(TENANT_ID)).thenReturn(Optional.of(tenant1));
        when(supplierRepositoryMock.findAllByTenantIdAndStatusIn(TENANT_ID, PageRequest.of(0, 25, Sort.by(ORDER_CRITERIA)), statusSet))
                .thenReturn(mockSupplierPage);

        List<SupplierViewDto> supplierViewDtos = supplierService.getAllByTenantIdAndStatusIn(TENANT_ID, 0, 25, statusSet);

        // Then
        assertNotNull(supplierViewDtos);
        assertEquals(mockSupplierList.size(), supplierViewDtos.size());
    }

    @Test
    @SneakyThrows
    public void GivenValidTenantId_WhenGetAllByTenantIdAndStatusIn_ThenSuppliersDtosReturned() {
        // Given
        Tenant tenant1 = new Tenant();
        tenant1.setId(TENANT_ID);

        List<Supplier> mockSupplierList = List.of(new Supplier(), new Supplier()); // Replace with actual User objects
        Page<Supplier> mockSupplierPage = new PageImpl<>(mockSupplierList);

        // When
        when(tenantServiceMock.findByTenantId(TENANT_ID)).thenReturn(Optional.of(tenant1));
        when(supplierRepositoryMock.findAllByTenantIdAndStatus(TENANT_ID, PageRequest.of(0, 25, Sort.by(ORDER_CRITERIA)), SupplierStatusEnum.APPROVED))
                .thenReturn(mockSupplierPage);

        List<SupplierViewDto> supplierViewDtos = supplierService.getAllByTenantIdAndStatus(TENANT_ID, 0, 25, SupplierStatusEnum.APPROVED);

        // Then
        assertNotNull(supplierViewDtos);
        assertEquals(mockSupplierList.size(), supplierViewDtos.size());
    }

    @Test
    @SneakyThrows
    public void GivenValidTenantId_WhenCountByTenantId_ThenShouldCount() {

        tenant.setId(TENANT_ID);
        when(tenantServiceMock.findByTenantId(TENANT_ID)).thenReturn(Optional.of(tenant));
        when(supplierRepositoryMock.countByTenantIdAndStatusIn(TENANT_ID, Set.of(SupplierStatusEnum.APPROVED))).thenReturn(2);

        Integer count = supplierService.countAllByTenantIdAndStatus(TENANT_ID, Set.of(SupplierStatusEnum.APPROVED));

        assertEquals(2, count);
    }

    @Test
    public void GivenNotExistingTenantId_WhenCountSuppliers_ThenExpectDtoValidateException() {
        when(tenantServiceMock.findByTenantId(TENANT_ID)).thenReturn(Optional.empty());

        assertThrows(DtoValidateNotFoundException.class, () -> {
            supplierService.countAllByTenantIdAndStatus(TENANT_ID, Set.of(SupplierStatusEnum.APPROVED));
        });
    }

    @Test
    public void GivenNotExistingSupplierId_WhenApproveSupplier_ThenExpectDtoValidateException() {
        // When Then
        assertThrows(DtoValidateNotFoundException.class,
                () -> supplierService.approveSupplier(SUPPLIER_ID, "en-Us"));
    }

    @Test
    @SneakyThrows
    public void GivenValidSupplierId_WhenApproveSupplier_ThenShouldUpdate() {
        //Given
        Tenant mockedTenand = Tenant.builder().name("TestTenant").build();
        Supplier mockedSupplier = Supplier.builder().tenant(mockedTenand).build();
        mockedSupplier.setId(SUPPLIER_ID);
        List<User> userList = Arrays.asList(User.builder().username("username1").build(),
                User.builder().username("username2").build());
        BufferedImage dummyImage = new BufferedImage(100, 100, BufferedImage.TYPE_INT_RGB);

        //When
        when(supplierService.findBySupplierId(SUPPLIER_ID)).thenReturn(Optional.of(mockedSupplier));
        when(userServiceMock.findAllBySupplierId(mockedSupplier.getId())).thenReturn(userList);
        doNothing().when(emailService).sendApproveProfileEmail(any(), any(), any(), any(), any());

        supplierService.approveSupplier(SUPPLIER_ID, "en-Us");

        //Then
        verify(supplierRepositoryMock, times(1)).save(mockedSupplier);
    }

    @Test
    @SneakyThrows
    public void GivenValidData_WhenSendReviewEmailToSupplierWithApproved_ThenExpectSendApproveProfileEmailToBeCalled() {

        // Given
        UUID supplierId = UUID.randomUUID();
        String language = "en";

        Tenant mockedTenand = Tenant.builder().name("TestTenant").build();
        Supplier mockedSupplier = Supplier.builder().tenant(mockedTenand).build();
        mockedSupplier.setId(supplierId);
        List<User> userList = Arrays.asList(User.builder().username("username1").build(),
                User.builder().username("username2").build());

        // When
        when(userServiceMock.findAllBySupplierId(supplierId)).thenReturn(userList);

        doNothing().when(emailService).sendApproveProfileEmail(any(), any(), any(), any(), any());

        supplierService.sendReviewEmailToSupplier(mockedSupplier, SupplierStatusEnum.APPROVED, language);

        // Then
        verify(emailService, times(1)).sendApproveProfileEmail(any(), any(), any(), any(), any());
    }

    @Test
    @SneakyThrows
    public void GivenValidData_WhenSendReviewEmailToSupplier_ThenExpectEmailServiceNotToBeCalled() {
        // Given
        UUID supplierId = UUID.randomUUID();
        String language = "en";

        Tenant mockedTenand = Tenant.builder().name("TestTenant").build();
        Supplier mockedSupplier = Supplier.builder().tenant(mockedTenand).build();
        mockedSupplier.setId(supplierId);

        List<User> userList = Arrays.asList(User.builder().username("username1").build(),
                User.builder().username("username2").build());

        // When
        when(userServiceMock.findAllBySupplierId(supplierId)).thenReturn(userList);

        supplierService.sendReviewEmailToSupplier(mockedSupplier, SupplierStatusEnum.REJECTED, language);

        // Then
        verify(emailService, never()).sendApproveProfileEmail(any(), any(), any(), any(), any());
    }

    @Test
    public void GivenValidData_WhenUpdateSupplierHasStatusUpdate_ThenExpectRepostitoryToBeCalled() {
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
    public void GivenValidData_WhenUpdateupdateSupplierStatus_ThenExpectRepostitorySaveToBeCalled() {
        // Given
        Supplier supplier = Supplier.builder().build();
        // When
        when(supplierRepositoryMock.save(supplier)).thenReturn(supplier);

        supplierService.updateSupplierStatus(supplier, SupplierStatusEnum.APPROVED);

        // Then
        assertEquals(supplier.isHasStatusUpdate(), true);
        verify(supplierRepositoryMock, times(1)).save(supplier);
    }

    @Test
    public void GivenNotExistingSupplierId_WhenRejectSupplier_ThenExpectDtoValidateException() {
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
    public void GivenNotExistingSupplierId_WhenGetRejectedSupplier_ThenExpectDtoValidateException() {
        //Given
        RejectSupplierDto rejectSupplierDto = new RejectSupplierDto(
                RejectionReason.DUPLICATE,
                "",
                SUPPLIER_ID
        );

        // When Then
        assertThrows(DtoValidateNotFoundException.class, () ->
                supplierService.getRejectedSupplier(SUPPLIER_ID));
    }

    @Test
    @SneakyThrows
    public void GivenValidRequest_WhenRejectSupplier_ThenExpectSavingRejectSupplier() {
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
        when(tenantServiceMock.findByTenantId(any())).thenReturn(Optional.of(tenant));
        when(userServiceMock.findAllBySupplierId(mockedSupplier.getId())).thenReturn(userList);

        // Then
        supplierService.rejectSupplier(rejectSupplierDto, "en-Us", RejectionReason.NOT_IN_REGION.toString());

        verify(rejectSupplierRepository).save(argThat(
                rejectSupplier -> Objects.equals(rejectSupplier.getReason(), rejectSupplierDto.reason())
                        && Objects.equals(rejectSupplier.getComments(), rejectSupplierDto.comments())
        ));
    }

    @Test
    public void GivenValidSupplierIdAndException_WhenApproveSupplier_ThenExpectDtoValidateException() throws Exception {
        //Given
        Tenant mockedTenand = Tenant.builder().name("TestTenant").build();
        Supplier mockedSupplier = Supplier.builder().tenant(mockedTenand).build();
        mockedSupplier.setId(SUPPLIER_ID);
        List<User> userList = Arrays.asList(User.builder().username("username1").build(),
                User.builder().username("username2").build());
        //When
        when(supplierService.findBySupplierId(SUPPLIER_ID)).thenReturn(Optional.of(mockedSupplier));

        //Then
        assertThrows(DtoValidateException.class, () ->
                supplierService.approveSupplier(SUPPLIER_ID, "en-Us"));
    }

    @Test
    public void testGetAllByTenantIdForMap_TenantNotFound() {
        // Given
        when(tenantServiceMock.findByTenantId(TENANT_ID)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(DtoValidateNotFoundException.class, () -> {
            supplierService.getAllByTenantIdForMap(TENANT_ID);
        });
    }

    @Test
    public void testGetAllByTenantIdForMap_NoSuppliers() throws DtoValidateNotFoundException {
        // Given
        when(tenantServiceMock.findByTenantId(TENANT_ID)).thenReturn(Optional.of(tenant));
        when(supplierRepositoryMock.findAllByTenantIdAndStatus(TENANT_ID, SupplierStatusEnum.APPROVED))
                .thenReturn(List.of());

        // When
        List<SupplierForMapViewDto> result = supplierService.getAllByTenantIdForMap(TENANT_ID);

        // Then
        assertEquals(0, result.size());
    }

    @Test
    public void testTnGetAllByTenantIdForMap_SuppliersFound() throws DtoValidateNotFoundException {
        // Given
        supplier.setProfile(new SupplierProfile());
        when(tenantServiceMock.findByTenantId(TENANT_ID)).thenReturn(Optional.of(tenant));
        when(supplierRepositoryMock.findAllByTenantIdAndStatus(TENANT_ID, SupplierStatusEnum.APPROVED))
                .thenReturn(List.of(supplier));

        SupplierForMapViewDto expectedDto = ModelConverter.entityToSupplierForMapViewDto(supplier);

        // When
        List<SupplierForMapViewDto> result = supplierService.getAllByTenantIdForMap(TENANT_ID);

        // Then
        assertEquals(1, result.size());
        assertEquals(expectedDto, result.get(0));
    }
}
