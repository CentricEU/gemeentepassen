package nl.centric.innovation.local4local.unit;

import nl.centric.innovation.local4local.dto.InvoiceDto;
import nl.centric.innovation.local4local.dto.OfferTransactionInvoiceDto;
import nl.centric.innovation.local4local.entity.Supplier;
import nl.centric.innovation.local4local.entity.SupplierProfile;
import nl.centric.innovation.local4local.entity.Tenant;
import nl.centric.innovation.local4local.entity.User;
import nl.centric.innovation.local4local.service.impl.InvoiceService;
import nl.centric.innovation.local4local.service.impl.OfferTransactionService;
import nl.centric.innovation.local4local.service.impl.PrincipalService;
import nl.centric.innovation.local4local.service.impl.SupplierService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.thymeleaf.ITemplateEngine;

import org.thymeleaf.context.Context;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.Mockito.when;


@ExtendWith(MockitoExtension.class)
class InvoiceServiceTests {

    private static final String INVOICE_NUMBER = "INV-1234";
    private static final LocalDate INVOICE_DATE = LocalDate.of(2025, 2, 1);
    private static final LocalDate DUE_DATE = LocalDate.of(2025, 3, 1);
    private static final int MONTH = 2;

    @Mock
    private OfferTransactionService offerTransactionService;

    @Mock
    private PrincipalService principalService;

    @Mock
    private SupplierService supplierService;

    @Mock
    private ITemplateEngine templateEngine;

    @InjectMocks
    private InvoiceService invoiceService;

    private InvoiceDto invoiceDto;

    @BeforeEach
    void setUp() {
        invoiceDto = new InvoiceDto(INVOICE_NUMBER, INVOICE_DATE, DUE_DATE, MONTH);
    }


    @Test
    void GivenInvoiceDto_WhenGenerateInvoice_ThenPdfIsGenerated() {
        // When
        when(principalService.getSupplierId()).thenReturn(mockUserWithTenant().getSupplier().getId());
        when(principalService.getTenant()).thenReturn(mockUserWithTenant().getSupplier().getTenant());
        when(offerTransactionService.getTransactionsByMonthAndYear(LocalDate.of(2025,2,1), LocalDate.of(2025,2,28))).thenReturn(mockOfferTransactions());
        when(principalService.getUserFullName()).thenReturn("John Doe");
        UUID supplierId = mockUserWithTenant().getSupplier().getId();
        when(supplierService.findBySupplierId(supplierId)).thenReturn(Optional.of(mockSupplierWithProfile()));
        String htmlContent = "<html><body><p>Invoice Content</p></body></html>";
        when(templateEngine.process(Mockito.anyString(), Mockito.any())).thenReturn(htmlContent);

        // Capture the context
        ArgumentCaptor<Context> contextCaptor = ArgumentCaptor.forClass(Context.class);

        // Verify
        byte[] pdfBytes = invoiceService.generateInvoice(invoiceDto, "en");

        // Capture the context passed to the template engine
        Mockito.verify(templateEngine).process(Mockito.anyString(), contextCaptor.capture());
        Context capturedContext = contextCaptor.getValue();

        // Assertions
        Assertions.assertNotNull(pdfBytes);
        Assertions.assertEquals("Tenant Name", capturedContext.getVariable("municipalityName"));
        Assertions.assertEquals("Tenant Address", capturedContext.getVariable("municipalityAddress"));
        Assertions.assertEquals("Location, Province, Zip, Location", capturedContext.getVariable("supplierAddress"));
        Assertions.assertEquals("01/02/2025 - 28/02/2025", capturedContext.getVariable("billingPeriod"));
        Assertions.assertEquals("01/03/2025", capturedContext.getVariable("issueDate"));
        Assertions.assertEquals("03/03/2025", capturedContext.getVariable("dueDate"));
        Assertions.assertEquals("220,00", capturedContext.getVariable("totalAmount"));
        Assertions.assertEquals(mockOfferTransactions(), capturedContext.getVariable("offerTransactions"));
    }

    private User mockUserWithTenant() {
        User user = new User();
        Supplier supplier = new Supplier();
        Tenant tenant = new Tenant();
        tenant.setName("Tenant Name");
        tenant.setAddress("Tenant Address");
        supplier.setTenant(tenant);
        user.setSupplier(supplier);
        return user;
    }

    private Supplier mockSupplierWithProfile() {
        Supplier supplier = new Supplier();
        SupplierProfile profile = new SupplierProfile();
        profile.setBranchLocation("Location");
        profile.setBranchProvince("Province");
        profile.setBranchZip("Zip");
        supplier.setProfile(profile);
        return supplier;
    }

    private List<OfferTransactionInvoiceDto> mockOfferTransactions() {
        OfferTransactionInvoiceDto transaction1 = new OfferTransactionInvoiceDto("1234", 100.0, "Grant1, Grant2", "2025-02-01");
        OfferTransactionInvoiceDto transaction2 = new OfferTransactionInvoiceDto("123467", 120.0, "Grant1, Grant2", "2025-02-01");
        return List.of(transaction1, transaction2);
    }
}