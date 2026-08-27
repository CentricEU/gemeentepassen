package nl.centric.innovation.local4local.unit;

import nl.centric.innovation.local4local.controller.SupplierController;
import nl.centric.innovation.local4local.dto.SupplierViewDto;
import nl.centric.innovation.local4local.entity.Supplier;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.repository.TenantRepository;
import nl.centric.innovation.local4local.service.impl.SupplierService;
import nl.centric.innovation.local4local.service.impl.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SupplierControllerTests {

    @InjectMocks
    private SupplierController supplierController;

    @Mock
    private SupplierService supplierServiceMock;

    @Mock
    private UserService userServiceMock;

    @Mock
    private TenantRepository tenantRepository;

    private static final UUID SUPPLIER_ID = UUID.randomUUID();

    @Test
    void GivenValidSupplierId_WhenGetSupplierDetail_ThenExpectOkWithSupplierViewDto() throws Exception {
        // Given
        Supplier supplier = Supplier.builder().build();
        supplier.setId(SUPPLIER_ID);

        when(supplierServiceMock.getSupplierAndValidateOnPrincipal(SUPPLIER_ID)).thenReturn(supplier);

        // When
        ResponseEntity<SupplierViewDto> response = supplierController.getSupplierDetail(SUPPLIER_ID);

        // Then
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(SUPPLIER_ID, response.getBody().id());
    }

    @Test
    void GivenServiceThrowsException_WhenGetSupplierDetail_ThenExpectDtoValidateNotFoundException() throws Exception {
        // Given
        when(supplierServiceMock.getSupplierAndValidateOnPrincipal(SUPPLIER_ID))
                .thenThrow(new DtoValidateNotFoundException("error.entity.notfound"));

        // When & Then
        assertThrows(DtoValidateNotFoundException.class,
                () -> supplierController.getSupplierDetail(SUPPLIER_ID));
    }

    @Test
    void GivenValidSupplierId_WhenGetSupplier_ThenExpectOkWithSupplierViewDto() throws Exception {
        // Given
        Supplier supplier = Supplier.builder().build();
        supplier.setId(SUPPLIER_ID);

        when(supplierServiceMock.getSupplierAndValidateOnTenant(SUPPLIER_ID)).thenReturn(supplier);

        // When
        ResponseEntity<SupplierViewDto> response = supplierController.getSupplier(SUPPLIER_ID);

        // Then
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(SUPPLIER_ID, response.getBody().id());
    }

    @Test
    void GivenServiceThrowsException_WhenGetSupplier_ThenExpectDtoValidateNotFoundException() throws Exception {
        // Given
        when(supplierServiceMock.getSupplierAndValidateOnTenant(SUPPLIER_ID))
                .thenThrow(new DtoValidateNotFoundException("error.entity.notfound"));

        // When & Then
        assertThrows(DtoValidateNotFoundException.class,
                () -> supplierController.getSupplier(SUPPLIER_ID));
    }
}
