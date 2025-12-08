package nl.centric.innovation.local4local.unit;

import lombok.SneakyThrows;
import nl.centric.innovation.local4local.dto.LatLonDto;
import nl.centric.innovation.local4local.dto.SupplierProfileDto;
import nl.centric.innovation.local4local.dto.SupplierProfilePatchDto;
import nl.centric.innovation.local4local.dto.WorkingHoursCreateDto;
import nl.centric.innovation.local4local.entity.RejectSupplier;
import nl.centric.innovation.local4local.entity.Supplier;
import nl.centric.innovation.local4local.entity.SupplierProfile;
import nl.centric.innovation.local4local.entity.Tenant;
import nl.centric.innovation.local4local.entity.User;
import nl.centric.innovation.local4local.enums.SupplierStatusEnum;
import nl.centric.innovation.local4local.exceptions.DtoValidateAlreadyExistsException;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.repository.RejectSupplierRepository;
import nl.centric.innovation.local4local.repository.SupplierProfileRepository;
import nl.centric.innovation.local4local.repository.SupplierRepository;
import nl.centric.innovation.local4local.service.impl.PrincipalService;
import nl.centric.innovation.local4local.service.impl.SupplierProfileService;
import nl.centric.innovation.local4local.service.impl.SupplierService;
import nl.centric.innovation.local4local.service.impl.TenantService;
import nl.centric.innovation.local4local.service.impl.UserService;
import nl.centric.innovation.local4local.service.interfaces.EmailService;
import nl.centric.innovation.local4local.service.interfaces.WorkingHoursService;
import nl.centric.innovation.local4local.util.validator.Validators;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SupplierProfileServiceImplTests {

    @InjectMocks
    private SupplierProfileService supplierProfileService;
    @Mock
    private SupplierProfileRepository supplierProfileRepository;
    @Mock
    private SupplierRepository supplierRepository;
    @Mock
    private SupplierService supplierService;
    @Mock
    private UserService userService;

    @Mock
    private RejectSupplierRepository rejectSupplierRepository;

    @Mock
    private TenantService tenantService;

    @Mock
    private EmailService emailService;

    @Mock
    private PrincipalService principalService;

    @Mock
    private WorkingHoursService workingHoursService;

    private Supplier supplier;

    private SupplierProfile supplierProfile;

    private LatLonDto latlon;

    private static final UUID SUPPLIER_ID = UUID.randomUUID();

    private static final String EMPTY_STRING = "";

    @BeforeEach
    void setup() {
        supplier = new Supplier();
        supplierProfile = new SupplierProfile();
        latlon = new LatLonDto(2.0, 50.0);
    }

    @Test
    void GivenEmptyLogoString_WhenSaveSupplierProfile_ThenExpectReturnTrue() {
        // Given
        boolean result = Validators.isImageSizeValid(200, EMPTY_STRING);
        // When Then
        Assertions.assertTrue(result);
    }

    @Test
    void GivenEmptyTelephoneString_WhenSaveSupplierProfile_ThenExpectReturnTrue() {
        // Given
        boolean result = Validators.isTelephoneValid(EMPTY_STRING);
        // When Then
        Assertions.assertTrue(result);
    }

    @Test
    void GivenKvkNotValid_WhenSaveSupplierProfile_ThenExpectDtoValidateException() {
        // Given
        SupplierProfileDto supplierProfileDto = supplierProfileDtoBuilder("string", "123", "email@domain.com", "1234fe",
                "+31123456789", latlon);
        // When Then
        Assertions.assertThrows(DtoValidateException.class, () -> supplierProfileService.save(supplierProfileDto, "nl-NL"));
    }

    @Test
    void GivenEmailNotValid_WhenSaveSupplierProfile_ThenExpectDtoValidateException() {
        // Given
        SupplierProfileDto supplierProfileDto = supplierProfileDtoBuilder("string", "12345678", "invalid", "1234fe",
                "+31123456789", latlon);
        // When Then
        Assertions.assertThrows(DtoValidateException.class, () -> supplierProfileService.save(supplierProfileDto, "nl-NL"));
    }

    @Test
    void GivenEmailNotValid_WhenUpdateSupplierProfile_ThenExpectDtoValidateException() {
        // Given
        SupplierProfilePatchDto supplierProfileDto = supplierProfilePatchDtoBuilder("string", "invalid", "1234fe",
                "+31123456789", latlon);
        // When Then
        Assertions.assertThrows(DtoValidateException.class, () -> supplierProfileService.updateSupplierProfile(supplierProfileDto));
    }

    @Test
    void GivenZipCodeNotValid_WhenSaveSupplierProfile_ThenExpectDtoValidateException() {
        // Given
        SupplierProfileDto supplierProfileDto = supplierProfileDtoBuilder("string", "12345678", "email@domain.com",
                "134fe", "+31123456789", latlon);

        // When Then
        Assertions.assertThrows(DtoValidateException.class, () -> supplierProfileService.save(supplierProfileDto, "nl-NL"));
    }

    @Test
    void GivenTelephoneNotValid_WhenSaveSupplierProfile_ThenExpectDtoValidateException() {
        // Given
        SupplierProfileDto supplierProfileDto = supplierProfileDtoBuilder("string", "12345678", "email@domain.com",
                "1234fe", "+3112456789", latlon);

        // When Then
        Assertions.assertThrows(DtoValidateException.class, () -> supplierProfileService.save(supplierProfileDto, "nl-NL"));
    }

    @Test
    void GivenNotExistingSupplierId_WhenSaveForSupplierProfile_ThenExpectDtoValidateException() {
        // Given
        SupplierProfileDto supplierProfileDto = supplierProfileDtoBuilder("string", "12345678", "email@domain.com",
                "1234fe", "+31123456789", latlon);

        // When Then
        Assertions.assertThrows(DtoValidateNotFoundException.class, () -> supplierProfileService.save(supplierProfileDto, "nl-NL"));
    }

    @Test
    void GivenNotValidLogoSize_WhenUpdateForSupplierProfile_ThenExpectDtoValidateException() {
        // Given
        String logo = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAA";
        SupplierProfilePatchDto supplierProfileDto = supplierProfilePatchDtoBuilder(logo, "email@domain.com",
                "1234fe", "+31123456789", latlon);

        // When Then
        Assertions.assertThrows(DtoValidateException.class, () -> supplierProfileService.updateSupplierProfile(supplierProfileDto));
    }

    @Test
    void GivenNotValidLogoSize_WhenSaveForSupplierProfile_ThenExpectDtoValidateException() {
        // Given
        String logo = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAA";
        SupplierProfileDto supplierProfileDto = supplierProfileDtoBuilder(logo, "12345678", "email@domain.com",
                "1234fe", "+31123456789", latlon);

        // When Then
        Assertions.assertThrows(DtoValidateException.class, () -> supplierProfileService.save(supplierProfileDto, "nl-NL"));
    }

    @Test
    void GivenAlreadyExistingSupplier_WhenSaveForSupplierProfile_ThenExpectDtoValidateException() {
        // Given
        SupplierProfileDto supplierProfileDto = supplierProfileDtoBuilder("string", "12345678", "email@domain.com",
                "1234fe", "+31123456789", latlon);
        supplier.setProfile(SupplierProfile.supplierProfileToEntity(supplierProfileDto));
        // When
        when(supplierService.findBySupplierId(any())).thenReturn(Optional.of(supplier));
        // Then
        Assertions.assertThrows(DtoValidateAlreadyExistsException.class, () -> supplierProfileService.save(supplierProfileDto, "nl-NL"));
    }

    @Test
    @SneakyThrows
    void GivenValidRequest_WhenSaveForSupplierProfile_ThenExpectSavingSupplierProfile() {
        // Given
        SupplierProfileDto supplierProfileDto = supplierProfileDtoBuilder("string", "12345678", "email@domain.com",
                "1234fe", "+31123456789", latlon);

        SupplierProfile expectedSupplierProfile = SupplierProfile.supplierProfileToEntity(supplierProfileDto);
        expectedSupplierProfile.setCoordinatesString("{\"longitude\":50.0, \"latitude\":2.0}");

        // When
        when(principalService.getTenant()).thenReturn(mock(Tenant.class));
        when(principalService.getTenantId()).thenReturn(UUID.randomUUID());
        when(workingHoursService.createWorkingHours(any(), any())).thenReturn(new ArrayList<>());
        when(supplierProfileRepository.save(any(SupplierProfile.class))).thenReturn(mock(SupplierProfile.class));
        when(supplierService.findBySupplierId(any())).thenReturn(Optional.of(supplier));

        // Then
        supplierProfileService.save(supplierProfileDto, "nl-NL");

        verify(supplierProfileRepository).save(argThat(
                supplierProfileEntity -> Objects.equals(supplierProfileEntity.getLogo(), expectedSupplierProfile.getLogo())
                        && Objects.equals(supplierProfileEntity.getOwnerName(), expectedSupplierProfile.getOwnerName())
                        && Objects.equals(supplierProfileEntity.getGroupName(), expectedSupplierProfile.getGroupName())
                        && Objects.equals(supplierProfileEntity.getCompanyBranchAddress(), expectedSupplierProfile.getCompanyBranchAddress())
                        && Objects.equals(supplierProfileEntity.getBranchProvince(), expectedSupplierProfile.getBranchProvince())
                        && Objects.equals(supplierProfileEntity.getBranchZip(), expectedSupplierProfile.getBranchZip())
                        && Objects.equals(supplierProfileEntity.getBranchLocation(), expectedSupplierProfile.getBranchLocation())
                        && Objects.equals(supplierProfileEntity.getBranchTelephone(), expectedSupplierProfile.getBranchTelephone())
                        && Objects.equals(supplierProfileEntity.getEmail(), expectedSupplierProfile.getEmail())
                        && Objects.equals(supplierProfileEntity.getWebsite(), expectedSupplierProfile.getWebsite())
                        && Objects.equals(supplierProfileEntity.getAccountManager(), expectedSupplierProfile.getAccountManager())
                        && Objects.equals(supplierProfileEntity.getCoordinatesString(), expectedSupplierProfile.getCoordinatesString())));
    }

    @Test
    @SneakyThrows
    void GivenValidRequest_WhenUpdateForSupplierProfile_ThenExpectSavingSupplierProfile() {
        // Given
        UUID tenantId = UUID.randomUUID();
        Tenant mockedTenant = new Tenant();
        mockedTenant.setId(tenantId);

        SupplierProfilePatchDto supplierProfileDto = supplierProfilePatchDtoBuilder("string", "email@domain.com",
                "1234fe", "+31123456789", latlon);
        supplier.setProfile(supplierProfile);

        // When
        when(supplierProfileRepository.save(any(SupplierProfile.class))).thenReturn(mock(SupplierProfile.class));
        when(supplierService.findBySupplierId(any())).thenReturn(Optional.of(supplier));

        // Then
        supplierProfileService.updateSupplierProfile(supplierProfileDto);

        ArgumentCaptor<SupplierProfile> captor = ArgumentCaptor.forClass(SupplierProfile.class);

        verify(supplierProfileRepository).save(captor.capture());
        SupplierProfile savedProfile = captor.getValue();

        Assertions.assertEquals(supplierProfileDto.logo(), savedProfile.getLogo());
        Assertions.assertEquals(supplierProfileDto.ownerName(), savedProfile.getOwnerName());
        Assertions.assertEquals(supplierProfileDto.legalForm(), savedProfile.getLegalForm().getId());
        Assertions.assertEquals(supplierProfileDto.group(), savedProfile.getGroupName().getId());
        Assertions.assertEquals(supplierProfileDto.companyBranchAddress(), savedProfile.getCompanyBranchAddress());
        Assertions.assertEquals(supplierProfileDto.branchProvince(), savedProfile.getBranchProvince());
        Assertions.assertEquals(supplierProfileDto.branchZip(), savedProfile.getBranchZip());
        Assertions.assertEquals(supplierProfileDto.branchLocation(), savedProfile.getBranchLocation());
        Assertions.assertEquals(supplierProfileDto.branchTelephone(), savedProfile.getBranchTelephone());
        Assertions.assertEquals(supplierProfileDto.email(), savedProfile.getEmail());
        Assertions.assertEquals(supplierProfileDto.website(), savedProfile.getWebsite());
        Assertions.assertEquals(supplierProfileDto.accountManager(), savedProfile.getAccountManager());
        Assertions.assertEquals(supplierProfileDto.iban(), savedProfile.getIban());
        Assertions.assertEquals(supplierProfileDto.bic(), savedProfile.getBic());
    }

    @Test
    @SneakyThrows
    void GivenValidData_WhenSendProfileSetupEmailToAllAdmins_ThenExpectEmailServiceToBeCalled() {

        // Given
        UUID tenantId = UUID.randomUUID();
        String language = "en";
        SupplierProfileDto supplierProfileDto = supplierProfileDtoBuilder("string", "12345678", "email@domain.com",
                "1234fe", "+31123456789", latlon);

        Tenant mockedTenant = new Tenant();
        mockedTenant.setId(tenantId);

        List<User> adminList = Arrays.asList(User.builder().username("username1").build(),
                User.builder().username("username2").build());

        // When
        when(principalService.getTenant()).thenReturn(mockedTenant);
        when(principalService.getTenantId()).thenReturn(tenantId);
        when(userService.findAllAdminsByTenantId(any())).thenReturn(adminList);

        doNothing().when(emailService).sendProfileCreatedEmail(any(), any(), any(), any(), any(), any());

        supplierProfileService.sendProfileSetupEmailToAllAdmins(supplierProfileDto.companyName(), supplierProfileDto.supplierProfilePatchDto().accountManager(), language);

        // Then
        verify(userService, times(1)).findAllAdminsByTenantId(tenantId);
        verify(emailService, times(1)).sendProfileCreatedEmail(any(), any(), any(), any(), any(), any());
    }

    @Test
    void GivenRejectedSupplier_WhenReapplySupplierProfile_ThenExpectSuccess() {
        // Given
        SupplierProfilePatchDto supplierProfileDto = supplierProfilePatchDtoBuilder("string", "email@domain.com",
                "1234fe", "+31123456789", latlon);
        Supplier supplier = new Supplier();
        supplier.setStatus(SupplierStatusEnum.REJECTED);
        supplier.setProfile(new SupplierProfile());

        // When
        when(supplierService.findBySupplierId(any())).thenReturn(Optional.of(supplier));
        when(principalService.getTenant()).thenReturn(mock(Tenant.class));
        doNothing().when(supplierService).updateSupplierStatus(any(), any());
        doNothing().when(emailService).sendProfileCreatedEmail(any(), any(), any(), any(), any(), any());
        when(rejectSupplierRepository.findBySupplierId(any())).thenReturn(Optional.of(mock(RejectSupplier.class)));

        // Then
        Assertions.assertDoesNotThrow(() -> supplierProfileService.reapplySupplierProfile(supplierProfileDto, "en"));
        verify(supplierService, times(1)).updateSupplierStatus(supplier, SupplierStatusEnum.PENDING);
        verify(emailService, times(1)).sendProfileCreatedEmail(any(), any(), any(), any(), any(), any());
        verify(rejectSupplierRepository, times(1)).deleteById(any());
    }

    @Test
    void GivenNonRejectedSupplier_WhenReapplySupplierProfile_ThenExpectDtoValidateException() {
        // Given
        SupplierProfilePatchDto supplierProfileDto = supplierProfilePatchDtoBuilder("string", "email@domain.com",
                "1234fe", "+31123456789", latlon);
        Supplier supplier = new Supplier();
        supplier.setStatus(SupplierStatusEnum.PENDING);

        // When
        when(supplierService.findBySupplierId(any())).thenReturn(Optional.of(supplier));

        // Then
        Assertions.assertThrows(DtoValidateException.class, () -> supplierProfileService.reapplySupplierProfile(supplierProfileDto, "en"));
        verify(supplierService, times(0)).updateSupplierStatus(any(), any());
        verify(emailService, times(0)).sendProfileCreatedEmail(any(), any(), any(), any(), any(), any());
        verify(rejectSupplierRepository, times(0)).deleteById(any());
    }


    @Test
    void GivenExistingEmail_WhenValidateCashierEmails_ThenExpectDtoValidateException() {
        // Given
        SupplierProfileDto supplierProfileDto = supplierProfileDtoBuilder("string", "12345678", "email@domain.com",
                "1234fe", "+31123456789", latlon);
        supplier.setProfile(SupplierProfile.supplierProfileToEntity(supplierProfileDto));

        // When
        when(userService.findByUsername("test@cashier.nl")).thenReturn(Optional.of(mock(User.class)));

        // Then
        Assertions.assertThrows(DtoValidateException.class, () -> supplierProfileService.save(supplierProfileDto, "nl-NL"));
    }

    private SupplierProfileDto supplierProfileDtoBuilder(String logo, String kvk, String email, String zipCode,
                                                         String telephone, LatLonDto latlon) {

        List<WorkingHoursCreateDto> workingHours = new ArrayList<>();

        SupplierProfilePatchDto patchDto = SupplierProfilePatchDto.builder()
                .logo(logo)
                .ownerName("owner")
                .legalForm(1)
                .group(0)
                .category(0)
                .subcategory(0)
                .iban("iban")
                .bic("bic")
                .companyBranchAddress("address")
                .branchProvince("district")
                .branchZip(zipCode)
                .branchLocation("location")
                .branchTelephone(telephone)
                .email("centric@centric.com")
                .website("website")
                .accountManager("accountManager")
                .supplierId(SUPPLIER_ID)
                .latlon(latlon)
                .cashierEmails(Set.of("test@cashier.nl"))
                .workingHours(workingHours)
                .build();

        return SupplierProfileDto.builder()
                .companyName("companyName")
                .kvkNumber(kvk)
                .adminEmail(email)
                .supplierProfilePatchDto(patchDto)
                .build();
    }

    private SupplierProfilePatchDto supplierProfilePatchDtoBuilder(String logo, String email, String zipCode,
                                                                   String telephone, LatLonDto latlon) {
        List<WorkingHoursCreateDto> workingHours = new ArrayList<>();
        return SupplierProfilePatchDto.builder().logo(logo).ownerName("owner")
                .legalForm(1).group(0).category(0).subcategory(0)
                .companyBranchAddress("address").branchProvince("district").branchZip(zipCode)
                .branchLocation("location").branchTelephone(telephone).email("centric@centric.com").website("website")
                .accountManager("accountManager").supplierId(SUPPLIER_ID).latlon(latlon)
                .workingHours(workingHours)
                .bic("bic")
                .iban("iban")
                .build();
    }
}
