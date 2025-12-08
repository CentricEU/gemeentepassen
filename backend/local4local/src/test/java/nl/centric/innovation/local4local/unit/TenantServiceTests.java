package nl.centric.innovation.local4local.unit;

import lombok.SneakyThrows;
import nl.centric.innovation.local4local.dto.TenantBankInformationDto;
import nl.centric.innovation.local4local.dto.TenantDto;
import nl.centric.innovation.local4local.dto.TenantViewDto;
import nl.centric.innovation.local4local.entity.Tenant;
import nl.centric.innovation.local4local.exceptions.DtoValidateAlreadyExistsException;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.repository.TenantRepository;
import nl.centric.innovation.local4local.service.impl.PrincipalService;
import nl.centric.innovation.local4local.service.impl.TenantService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TenantServiceTests {
    @InjectMocks
    private TenantService tenantService;

    @Mock
    private TenantRepository tenantRepositoryMock;

    @Mock
    private PrincipalService principalService;

    private List<Tenant> tenantList;

    @BeforeEach
    void setUp() {
        Tenant tenant1 = new Tenant();
        Tenant tenant2 = new Tenant();
        tenantList = List.of(tenant1, tenant2);
    }

    @Test
    void GivenValidRequest_WhenGetAllTenants_ThenExpectListOfTenants() {
        when(tenantRepositoryMock.findAll()).thenReturn(tenantList);
        List<TenantViewDto> tenants = tenantService.getAllTenants();
        assertEquals(2, tenants.size());
    }

    @Test
    @SneakyThrows
    void GivenValidId_WhenTenantExists_ThenExpectTenant() {
        UUID tenantId = UUID.randomUUID();
        Tenant expectedTenant = new Tenant();
        expectedTenant.setId(tenantId);
        expectedTenant.setName("Test Tenant");
        expectedTenant.setAddress("Test Address");
        expectedTenant.setWage(1000.0);

        expectedTenant.setLogo("logo-image-data-as-string".getBytes());

        when(tenantRepositoryMock.findById(tenantId)).thenReturn(Optional.of(expectedTenant));

        TenantViewDto result = tenantService.findByTenantId(tenantId);

        assertEquals(expectedTenant.getId(), result.id(), "Returned Tenant ID should match the expected");
        assertEquals(expectedTenant.getName(), result.name(), "Returned Tenant name should match the expected");
        assertEquals(expectedTenant.getAddress(), result.address(), "Returned Tenant address should match the expected");
        assertEquals(expectedTenant.getWage(), result.wage(), "Returned Tenant wage should match the expected");
        assertEquals(java.util.Base64.getEncoder().encodeToString(expectedTenant.getLogo()), result.logo(), "Returned Tenant logo should match the expected");
    }

    @Test
    @SneakyThrows
    void GivenNoValidId_WhenFindByTenantId_ThenExpectEmptyOptional() {
        UUID tenantId = UUID.randomUUID();
        when(tenantRepositoryMock.findById(tenantId)).thenReturn(Optional.empty());

        assertThrows(DtoValidateException.class, () -> tenantService.findByTenantId(tenantId),
                "Expected NoSuchElementException when tenant is not found");
    }

    @Test
    void GivenTenant_WhenSaveTenant_ThenExpectTenantViewDto() {
        UUID id = UUID.randomUUID();
        Tenant tenant = new Tenant();
        tenant.setId(id);
        TenantDto tenantDto = new TenantDto("Test Tenant", "Test Address", 1115.0, "test@municipality.nl", "+33 123 456");

        when(tenantRepositoryMock.save(any(Tenant.class))).thenReturn(tenant);

        TenantViewDto resultDto = tenantService.save(tenantDto);

        assertNotNull(resultDto, "TenantViewDto should not be null");
        assertEquals(id, resultDto.id(), "The DTO ID should match the expected ID");
    }

    @Test
    void GivenValidTenantWithoutBankInfo_WhenSaveBankInformation_ThenExpectSuccess() throws DtoValidateException {
        UUID tenantId = UUID.randomUUID();
        Tenant tenant = new Tenant();
        tenant.setId(tenantId);

        when(principalService.getTenantId()).thenReturn(tenantId);
        when(tenantRepositoryMock.findById(tenantId)).thenReturn(Optional.of(tenant));

        TenantBankInformationDto bankInformationDto = new TenantBankInformationDto("IBAN123456", "BIC123");

        tenantService.saveTenantBankInformation(bankInformationDto);

        assertEquals("BIC123", tenant.getBic());
        assertEquals("IBAN123456", tenant.getIban());
    }

    @Test
    void GivenTenantNotFound_WhenSaveBankInformation_ThenExpectDtoValidateException() {
        UUID tenantId = UUID.randomUUID();

        when(principalService.getTenantId()).thenReturn(tenantId);
        when(tenantRepositoryMock.findById(tenantId)).thenReturn(Optional.empty());

        TenantBankInformationDto bankInformationDto = new TenantBankInformationDto("IBAN123456", "BIC123");

        assertThrows(DtoValidateException.class, () -> tenantService.saveTenantBankInformation(bankInformationDto),
                "Expected DtoValidateException when tenant is not found");
    }

    @Test
    void GivenTenantAlreadyHasBankInfo_WhenSaveBankInformation_ThenExpectDtoValidateAlreadyExistsException() {
        UUID tenantId = UUID.randomUUID();
        Tenant tenant = new Tenant();
        tenant.setId(tenantId);
        tenant.setIban("ExistingIBAN");

        when(principalService.getTenantId()).thenReturn(tenantId);
        when(tenantRepositoryMock.findById(tenantId)).thenReturn(Optional.of(tenant));

        TenantBankInformationDto bankInformationDto = new TenantBankInformationDto("IBAN123456", "BIC123");

        assertThrows(DtoValidateAlreadyExistsException.class, () -> tenantService.saveTenantBankInformation(bankInformationDto),
                "Expected DtoValidateAlreadyExistsException when tenant already has bank information");
    }
}
