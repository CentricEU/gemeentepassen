package nl.centric.innovation.local4local.unit;

import nl.centric.innovation.local4local.dto.TenantViewDto;
import nl.centric.innovation.local4local.entity.Tenant;
import nl.centric.innovation.local4local.repository.TenantRepository;
import nl.centric.innovation.local4local.service.impl.TenantServiceImpl;
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
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class TenantServiceImplTests {
    @InjectMocks
    private TenantServiceImpl tenantService;

    @Mock
    private TenantRepository tenantRepositoryMock;

    private List<Tenant> tenantList;

    @BeforeEach
    void setUp() {
        Tenant tenant1 = new Tenant();
        Tenant tenant2 = new Tenant();
        tenantList = List.of(tenant1, tenant2);
    }

    @Test
    public void GivenValidRequest_WhenGetAllTenants_ThenExpectListOfTenants() {
        when(tenantRepositoryMock.findAll()).thenReturn(tenantList);
        List<TenantViewDto> tenants = tenantService.getAllTenants();
        assertEquals(2, tenants.size());
    }

    @Test
    void GivenValidId_WhenTenantExists_ThenExpectTenant() {
        UUID tenantId = UUID.randomUUID();
        Tenant expectedTenant = new Tenant();
        expectedTenant.setId(tenantId);
        when(tenantRepositoryMock.findById(tenantId)).thenReturn(Optional.of(expectedTenant));

        Optional<Tenant> result = tenantService.findByTenantId(tenantId);

        assertTrue(result.isPresent(), "Tenant should be found");
        assertEquals(expectedTenant, result.get(), "Returned Tenant should match the expected");
    }

    @Test
    void GivenNoValidId_WhenFindByTenantId_ThenExpectEmptyOptional() {
        UUID tenantId = UUID.randomUUID();
        when(tenantRepositoryMock.findById(tenantId)).thenReturn(Optional.empty());

        Optional<Tenant> result = tenantService.findByTenantId(tenantId);

        assertFalse(result.isPresent(), "No Tenant should be found");
    }

    @Test
    void GivenTenant_WhenSaveTenant_ThenExpectTenantViewDto() {
        UUID id = UUID.randomUUID();
        Tenant tenant = new Tenant();
        tenant.setId(id);

        when(tenantRepositoryMock.save(any(Tenant.class))).thenReturn(tenant);

        TenantViewDto resultDto = tenantService.save(tenant);

        assertNotNull(resultDto, "TenantViewDto should not be null");
        assertEquals(id, resultDto.id(), "The DTO ID should match the expected ID");
    }

    @Test
    void GivenFailureAtSaving_WhenSaveTenant_ThenExpectRuntimeException() {
        Tenant tenant = new Tenant();
        when(tenantRepositoryMock.save(any(Tenant.class))).thenThrow(new RuntimeException("Database error"));

        assertThrows(RuntimeException.class, () -> tenantService.save(tenant), "Expected exception to be thrown when repository operation fails");
    }
}
