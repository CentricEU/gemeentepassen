package nl.centric.innovation.local4local.unit;

import nl.centric.innovation.local4local.entity.Tenant;
import nl.centric.innovation.local4local.service.impl.SupplierService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import nl.centric.innovation.local4local.entity.Supplier;
import nl.centric.innovation.local4local.entity.User;
import nl.centric.innovation.local4local.service.impl.PrincipalService;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import java.util.UUID;

@ExtendWith(MockitoExtension.class)
class PrincipalServiceImplTests {
    @InjectMocks
    @Spy
    private PrincipalService principalService;

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<User> typedQuery;

    @Mock
    private SupplierService supplierService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(UUID.randomUUID());
        user.setFirstName("John");
        user.setLastName("Doe");

        Supplier supplier = new Supplier();
        supplier.setId(UUID.randomUUID());
        user.setSupplier(supplier);

        Authentication authentication = new UsernamePasswordAuthenticationToken(user, null);
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    @Test
    void Given_AuthenticationContextWithUser_ShouldReturnUserFullName() {
        // When
        String result = principalService.getUserFullName();

        // Then
        Assertions.assertEquals("John Doe", result);
    }

    @Test
    void Given_AuthenticationContextWithUser_ShouldReturnUser() {
        // When
        User result = principalService.getUser();

        // Then
        Assertions.assertEquals(user, result);
    }

    @Test
    void Given_AuthenticationContextWithTenant_ShouldReturnTenantId() {
        // When
        UUID result = principalService.getTenantId();

        // Then
        Assertions.assertEquals(user.getTenantId(), result);
    }

    @Test
    void Given_AuthenticationContextWithSupplier_ShouldReturnSupplierId() {
        // When
        UUID result = principalService.getSupplierId();

        // Then
        Assertions.assertEquals(user.getSupplier().getId(), result);
    }

    @Test
    void Given_AuthenticationContextWithUser_ShouldReturnTenant() {
        // Given
        Tenant tenant = new Tenant();
        tenant.setName("Tenant Name");
        user.getSupplier().setTenant(tenant);

        // When
        Tenant result = principalService.getTenant();

        // Then
        Assertions.assertEquals(tenant, result);
    }

}
