package nl.centric.innovation.local4local.unit;

import lombok.SneakyThrows;
import nl.centric.innovation.local4local.dto.LatLonDto;
import nl.centric.innovation.local4local.dto.SupplierProfileDto;
import nl.centric.innovation.local4local.dto.WorkingHoursCreateDto;
import nl.centric.innovation.local4local.entity.Supplier;
import nl.centric.innovation.local4local.entity.SupplierProfile;
import nl.centric.innovation.local4local.entity.Tenant;
import nl.centric.innovation.local4local.entity.User;
import nl.centric.innovation.local4local.exceptions.DtoValidateAlreadyExistsException;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.repository.SupplierProfileRepository;
import nl.centric.innovation.local4local.repository.SupplierRepository;
import nl.centric.innovation.local4local.service.impl.SupplierProfileServiceImpl;
import nl.centric.innovation.local4local.service.impl.UserService;
import nl.centric.innovation.local4local.service.interfaces.EmailService;
import nl.centric.innovation.local4local.service.interfaces.SupplierService;
import nl.centric.innovation.local4local.service.interfaces.TenantService;
import nl.centric.innovation.local4local.service.interfaces.WorkingHoursService;
import nl.centric.innovation.local4local.util.ModelConverter;
import nl.centric.innovation.local4local.util.Validators;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

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
public class SupplierProfileServiceImplTests {

    @InjectMocks
    private SupplierProfileServiceImpl supplierProfileService;
    @Mock
    private SupplierProfileRepository supplierProfileRepository;
    @Mock
    private SupplierService supplierService;
    @Mock
    private UserService userService;

    @Mock
    private TenantService tenantService;

    @Mock
    private SupplierRepository supplierRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private WorkingHoursService workingHoursService;

    private User user;
    private Supplier supplier;

    private SupplierProfile supplierProfile;

    private Tenant tenant;

    private LatLonDto latlon;

    private static final UUID SUPPLIER_ID = UUID.randomUUID();

    private static final String EMPTY_STRING = "";

    @BeforeEach
    void setup() {
        user = new User();
        supplier = new Supplier();
        supplierProfile = new SupplierProfile();
        tenant = new Tenant();
        latlon = new LatLonDto(2.0, 50.0);
    }

    @Test
    public void GivenEmptyLogoString_WhenSaveSupplierProfile_ThenExpectReturnTrue() {
        // Given
        boolean result = Validators.isImageSizeValid(200, EMPTY_STRING);
        // When Then
        Assertions.assertTrue(result);
    }

    @Test
    public void GivenEmptyTelephoneString_WhenSaveSupplierProfile_ThenExpectReturnTrue() {
        // Given
        boolean result = Validators.isTelephoneValid(EMPTY_STRING);
        // When Then
        Assertions.assertTrue(result);
    }

    @Test
    public void GivenKvkNotValid_WhenSaveSupplierProfile_ThenExpectDtoValidateException() {
        // Given
        SupplierProfileDto supplierProfileDto = supplierProfileDtoBuilder("string", "123", "email@domain.com", "1234fe",
                "+31123456789", latlon);
        // When Then
        assertThrows(DtoValidateException.class, () -> supplierProfileService.save(supplierProfileDto));
    }

    @Test
    public void GivenEmailNotValid_WhenSaveSupplierProfile_ThenExpectDtoValidateException() {
        // Given
        SupplierProfileDto supplierProfileDto = supplierProfileDtoBuilder("string", "12345678", "invalid", "1234fe",
                "+31123456789", latlon);
        // When Then
        assertThrows(DtoValidateException.class, () -> supplierProfileService.save(supplierProfileDto));
    }

    @Test
    public void GivenEmailNotValid_WhenUpdateSupplierProfile_ThenExpectDtoValidateException() {
        // Given
        SupplierProfileDto supplierProfileDto = supplierProfileDtoBuilder("string", "12345678", "invalid", "1234fe",
                "+31123456789", latlon);
        // When Then
        assertThrows(DtoValidateException.class, () -> supplierProfileService.updateSupplierProfile(supplierProfileDto));
    }

    @Test
    public void GivenZipCodeNotValid_WhenSaveSupplierProfile_ThenExpectDtoValidateException() {
        // Given
        SupplierProfileDto supplierProfileDto = supplierProfileDtoBuilder("string", "12345678", "email@domain.com",
                "134fe", "+31123456789", latlon);

        // When Then
        assertThrows(DtoValidateException.class, () -> supplierProfileService.save(supplierProfileDto));
    }

    @Test
    public void GivenTelephoneNotValid_WhenSaveSupplierProfile_ThenExpectDtoValidateException() {
        // Given
        SupplierProfileDto supplierProfileDto = supplierProfileDtoBuilder("string", "12345678", "email@domain.com",
                "1234fe", "+3112456789", latlon);

        // When Then
        assertThrows(DtoValidateException.class, () -> supplierProfileService.save(supplierProfileDto));
    }

    @Test
    public void GivenNotExistingSupplierId_WhenSaveForSupplierProfile_ThenExpectDtoValidateException() {
        // Given
        SupplierProfileDto supplierProfileDto = supplierProfileDtoBuilder("string", "12345678", "email@domain.com",
                "1234fe", "+31123456789", latlon);

        // When Then
        assertThrows(DtoValidateNotFoundException.class, () -> supplierProfileService.save(supplierProfileDto));
    }

    @Test
    public void GivenNotValidLogoSize_WhenUpdateForSupplierProfile_ThenExpectDtoValidateException() {
        // Given
        String logo = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAA";
        SupplierProfileDto supplierProfileDto = supplierProfileDtoBuilder(logo, "12345678", "email@domain.com",
                "1234fe", "+31123456789", latlon);

        // When Then
        assertThrows(DtoValidateException.class, () -> supplierProfileService.updateSupplierProfile(supplierProfileDto));
    }

    @Test
    public void GivenNotValidLogoSize_WhenSaveForSupplierProfile_ThenExpectDtoValidateException() {
        // Given
        String logo = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAA";
        SupplierProfileDto supplierProfileDto = supplierProfileDtoBuilder(logo, "12345678", "email@domain.com",
                "1234fe", "+31123456789", latlon);

        // When Then
        assertThrows(DtoValidateException.class, () -> supplierProfileService.save(supplierProfileDto));
    }

    @Test
    public void GivenAlreadyExistingSupplier_WhenSaveForSupplierProfile_ThenExpectDtoValidateException() {
        // Given
        SupplierProfileDto supplierProfileDto = supplierProfileDtoBuilder("string", "12345678", "email@domain.com",
                "1234fe", "+31123456789", latlon);
        supplier.setProfile(ModelConverter.supplierProfileToEntity(supplierProfileDto));
        // When
        when(supplierService.findBySupplierId(any())).thenReturn(Optional.of(supplier));
        // Then
        assertThrows(DtoValidateAlreadyExistsException.class, () -> supplierProfileService.save(supplierProfileDto));
    }

    @Test
    @SneakyThrows
    public void GivenValidRequest_WhenSaveForSupplierProfile_ThenExpectSavingSupplierProfile() {
        // Given
        SupplierProfileDto supplierProfileDto = supplierProfileDtoBuilder("string", "12345678", "email@domain.com",
                "1234fe", "+31123456789", latlon);
        
        // When
        when(supplierProfileRepository.save(any(SupplierProfile.class))).thenReturn(mock(SupplierProfile.class));
        when(supplierService.findBySupplierId(any())).thenReturn(Optional.of(supplier));

        // Then
        supplierProfileService.save(supplierProfileDto);

        verify(supplierProfileRepository).save(argThat(
                supplierProfile -> Objects.equals(supplierProfile.getLogo(), supplierProfileDto.logo())
                        && Objects.equals(supplierProfile.getOwnerName(), supplierProfileDto.ownerName())
                        && Objects.equals(supplierProfile.getGroupName().getId(), supplierProfileDto.group())
                        && Objects.equals(supplierProfile.getCompanyBranchAddress(), supplierProfileDto.companyBranchAddress())
                        && Objects.equals(supplierProfile.getBranchProvince(), supplierProfileDto.branchProvince())
                        && Objects.equals(supplierProfile.getBranchZip(), supplierProfileDto.branchZip())
                        && Objects.equals(supplierProfile.getBranchLocation(), supplierProfileDto.branchLocation())
                        && Objects.equals(supplierProfile.getBranchTelephone(), supplierProfileDto.branchTelephone())
                        && Objects.equals(supplierProfile.getEmail(), supplierProfileDto.email())
                        && Objects.equals(supplierProfile.getWebsite(), supplierProfileDto.website())
                        && Objects.equals(supplierProfile.getAccountManager(), supplierProfileDto.accountManager())));
    }

    @Test
    @SneakyThrows
    public void GivenValidRequest_WhenUpdateForSupplierProfile_ThenExpectSavingSupplierProfile() {
        // Given
        SupplierProfileDto supplierProfileDto = supplierProfileDtoBuilder("string", "12345678", "email@domain.com",
                "1234fe", "+31123456789", latlon);
        supplier.setProfile(supplierProfile);

        // When
        when(supplierProfileRepository.save(any(SupplierProfile.class))).thenReturn(mock(SupplierProfile.class));
        when(supplierService.findBySupplierId(any())).thenReturn(Optional.of(supplier));

        // Then
        supplierProfileService.updateSupplierProfile(supplierProfileDto);

        verify(supplierProfileRepository).save(argThat(
                supplierProfile -> Objects.equals(supplierProfile.getLogo(), supplierProfileDto.logo())
                        && Objects.equals(supplierProfile.getOwnerName(), supplierProfileDto.ownerName())
                        && Objects.equals(supplierProfile.getLegalForm().getId(), supplierProfileDto.legalForm())
                        && Objects.equals(supplierProfile.getGroupName().getId(), supplierProfileDto.group())
                        && Objects.equals(supplierProfile.getCompanyBranchAddress(), supplierProfileDto.companyBranchAddress())
                        && Objects.equals(supplierProfile.getBranchProvince(), supplierProfileDto.branchProvince())
                        && Objects.equals(supplierProfile.getBranchZip(), supplierProfileDto.branchZip())
                        && Objects.equals(supplierProfile.getBranchLocation(), supplierProfileDto.branchLocation())
                        && Objects.equals(supplierProfile.getBranchTelephone(), supplierProfileDto.branchTelephone())
                        && Objects.equals(supplierProfile.getEmail(), supplierProfileDto.email())
                        && Objects.equals(supplierProfile.getWebsite(), supplierProfileDto.website())
                        && Objects.equals(supplierProfile.getAccountManager(), supplierProfileDto.accountManager())));
    }

    @Test
    @SneakyThrows
    public void GivenValidData_WhenSendProfileSetupEmailToAllAdmins_ThenExpectEmailServiceToBeCalled() {

        // Given
        UUID tenantId = UUID.randomUUID();
        String language = "en";
        SupplierProfileDto supplierProfileDto = supplierProfileDtoBuilder("string", "12345678", "email@domain.com",
                "1234fe", "+31123456789", latlon);

        Tenant mockedTenant = new Tenant();

        List<User> adminList = Arrays.asList(User.builder().username("username1").build(),
                User.builder().username("username2").build());

        // When
        when(tenantService.findByTenantId(tenantId)).thenReturn(Optional.of(mockedTenant));

        when(userService.findAllAdminsByTenantId(tenantId)).thenReturn(adminList);

        doNothing().when(emailService).sendProfileCreatedEmail(any(), any(), any(), any(), any(), any());

        supplierProfileService.sendProfileSetupEmailToAllAdmins(tenantId, supplierProfileDto, language);

        // Then
        verify(tenantService, times(1)).findByTenantId(tenantId);
        verify(userService, times(1)).findAllAdminsByTenantId(tenantId);
        verify(emailService, times(1)).sendProfileCreatedEmail(any(), any(), any(), any(), any(), any());
    }

    @Test
    public void GivenNotExistingTenant_WhenSendProfileSetupEmailToAllAdmins_ThenExpectDtoValidateNotFoundException() {

        // Given
        UUID nonExistentTenantId = UUID.randomUUID();
        String language = "en";
        SupplierProfileDto supplierProfileDto = supplierProfileDtoBuilder("string", "12345678", "email@domain.com",
                "1234fe", "+31123456789", latlon);

        // When

        when(tenantService.findByTenantId(nonExistentTenantId)).thenReturn(Optional.empty());

        // Then
        assertThrows(DtoValidateNotFoundException.class, () -> supplierProfileService
                .sendProfileSetupEmailToAllAdmins(nonExistentTenantId, supplierProfileDto, language));

        verify(tenantService, times(1)).findByTenantId(nonExistentTenantId);
        verify(userService, never()).findAllAdminsByTenantId(any());
        verify(emailService, never()).sendProfileCreatedEmail(any(), any(), any(), any(), any(), any());
    }

    private SupplierProfileDto supplierProfileDtoBuilder(String logo, String kvk, String email, String zipCode,
                                                         String telephone, LatLonDto latlon) {
        List<WorkingHoursCreateDto> workingHours = new ArrayList<>();
        return SupplierProfileDto.builder().companyName("companyName").logo(logo).kvkNumber(kvk).ownerName("owner")
                .legalForm(1).group(0).category(0).subcategory(0).adminEmail(email)
                .companyBranchAddress("address").branchProvince("district").branchZip(zipCode)
                .branchLocation("location").branchTelephone(telephone).email("centric@centric.com").website("website")
                .accountManager("accountManager").supplierId(SUPPLIER_ID).latlon(latlon)
                .workingHours(workingHours)
                .build();
    }
}
