package nl.centric.innovation.local4local.unit;

import com.prowidesoftware.swift.model.mx.dic.CreditTransferTransactionInformation10;
import com.prowidesoftware.swift.model.mx.dic.GroupHeader32;
import com.prowidesoftware.swift.model.mx.dic.PaymentInstructionInformation3;
import lombok.SneakyThrows;
import nl.centric.innovation.local4local.dto.OfferTransactionInvoiceTenantView;
import nl.centric.innovation.local4local.dto.TenantViewDto;
import nl.centric.innovation.local4local.entity.OfferTransaction;
import nl.centric.innovation.local4local.entity.Supplier;
import nl.centric.innovation.local4local.entity.SupplierProfile;
import nl.centric.innovation.local4local.entity.Tenant;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.repository.TenantRepository;
import nl.centric.innovation.local4local.service.impl.OfferTransactionService;
import nl.centric.innovation.local4local.service.impl.PrincipalService;
import nl.centric.innovation.local4local.service.impl.SepaService;
import nl.centric.innovation.local4local.service.impl.SupplierService;
import nl.centric.innovation.local4local.service.impl.TenantService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.Assert.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SepaServiceTests {

    @Mock
    private OfferTransactionService offerTransactionService;

    @Mock
    private PrincipalService principalService;

    @Mock
    private SupplierService supplierService;

    @Mock
    private TenantRepository tenantRepository;

    @Mock
    private TenantService tenantService;

    @InjectMocks
    private SepaService sepaService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(sepaService, "errorEntityNotFound", "Entity not found");
    }

    @Test
    void GenerateSepaFile_ShouldReturnValidXml_WhenTransactionsExist() throws Exception {
        // Given
        UUID supplierId = UUID.randomUUID();
        UUID tenantId = UUID.randomUUID();

        Supplier mockSupplier = new Supplier();
        mockSupplier.setProfile(new SupplierProfile());
        mockSupplier.getProfile().setIban("NL55INGB0001234567");

        Optional<Tenant> municipalityTenant = Optional.ofNullable(Tenant.builder()
                .iban("NL91ABNA0417164300")
                .bic("ABNANL2AXXX")
                .build());

        OfferTransactionInvoiceTenantView view = mock(OfferTransactionInvoiceTenantView.class);
        when(view.getSupplierIban()).thenReturn("NL55INGB0001234567");
        when(view.getSupplierName()).thenReturn("Supplier Name");
        when(tenantService.findByTenantId(tenantId)).thenReturn(TenantViewDto.builder().name("Some Tenant Name").build());

        OfferTransaction offerTransaction = new OfferTransaction();
        offerTransaction.setAmount(BigDecimal.valueOf(100.0));
        offerTransaction.setCreatedDate(LocalDateTime.of(2024, 9, 1, 0, 0));

        when(view.getOfferTransaction()).thenReturn(offerTransaction);

        // When
        when(offerTransactionService.getTransactionsByIntervalAndTenantId(any(), any()))
                .thenReturn(List.of(view));
        when(principalService.getTenantId()).thenReturn(tenantId);
        when(tenantRepository.findById(tenantId)).thenReturn(municipalityTenant);
        //when(principalService.getTenant()).thenReturn(new Tenant());

        // Verify
        LocalDate startDate = LocalDate.of(2024, 6, 1);
        LocalDate endDate = LocalDate.of(2024, 6, 30);

        String xml = sepaService.generateSepaFile(startDate, endDate, null);

        Assertions.assertNotNull(xml);
        Assertions.assertTrue(xml.contains("<pain:CstmrCdtTrfInitn>"));
        Assertions.assertTrue(xml.contains("Supplier Name"));
        Assertions.assertTrue(xml.contains("NL55INGB0001234567"));
    }

    @Test
    void GenerateSepaFile_ShouldThrowException_WhenNoTransactions() {
        // Given
        LocalDate startDate = LocalDate.of(2024, 6, 1);
        LocalDate endDate = LocalDate.of(2024, 6, 30);

        when(offerTransactionService.getTransactionsByIntervalAndTenantId(any(), any()))
                .thenReturn(List.of());

        // When & Then
        DtoValidateNotFoundException exception = assertThrows(DtoValidateNotFoundException.class,
                () -> sepaService.generateSepaFile(startDate, endDate, null));

        Assertions.assertEquals("Entity not found", exception.getMessage());
    }

    @Test
    @SneakyThrows
    void buildGroupHeader_shouldReturnProperHeader() {
        // Given
        OfferTransactionInvoiceTenantView transaction1 = mock(OfferTransactionInvoiceTenantView.class);
        //when(transaction1.getSupplierName()).thenReturn("CreditorName");
        when(transaction1.getOfferTransaction()).thenReturn(OfferTransaction.builder()
                .amount(BigDecimal.valueOf(200.50))
                .build());

        OfferTransactionInvoiceTenantView transaction2 = mock(OfferTransactionInvoiceTenantView.class);
        //when(transaction2.getSupplierName()).thenReturn("CreditorName");
        when(transaction2.getOfferTransaction()).thenReturn(OfferTransaction.builder()
                .amount(BigDecimal.valueOf(200.50))
                .build());


        List<OfferTransactionInvoiceTenantView> transactions = List.of(transaction1, transaction2);

        // When
        when(tenantService.findByTenantId(any())).thenReturn(TenantViewDto.builder().name("DebtorName").build());

        GroupHeader32 header = (GroupHeader32) ReflectionTestUtils.invokeMethod(sepaService, "buildGroupHeader", transactions);

        // Verify
        Assertions.assertNotNull(header);
        Assertions.assertTrue(header.getMsgId().startsWith("MSG-"));
        Assertions.assertNotNull(header.getCreDtTm());
        Assertions.assertEquals("2", header.getNbOfTxs());
        Assertions.assertEquals(new BigDecimal("401.00"), header.getCtrlSum());
        Assertions.assertEquals("DebtorName", header.getInitgPty().getNm());
    }

    @Test
    @SneakyThrows
    void buildPaymentInfo_shouldSetCorrectValues() {
        // Given
        OfferTransactionInvoiceTenantView dto = mock(OfferTransactionInvoiceTenantView.class);
        when(dto.getOfferTransaction()).thenReturn(OfferTransaction.builder()
                .amount(BigDecimal.valueOf(123.45))
                .build());

        UUID tenantId = UUID.randomUUID();
        Optional<Tenant> municipalityTenant = Optional.ofNullable(Tenant.builder()
                .iban("NL91ABNA0417164300")
                .bic("ABNANL2AXXX")
                .build());
        // When
        when(principalService.getTenantId()).thenReturn(tenantId);
        when(tenantService.findByTenantId(tenantId)).thenReturn(TenantViewDto.builder().name("DebtorName").build());
        when(tenantRepository.findById(tenantId)).thenReturn(municipalityTenant);

        PaymentInstructionInformation3 paymentInfo = (PaymentInstructionInformation3) ReflectionTestUtils.invokeMethod(sepaService, "buildPaymentInfo", List.of(dto));

        // Verify
        Assertions.assertNotNull(paymentInfo);
        Assertions.assertTrue(paymentInfo.getPmtInfId().startsWith("PMT-"));
        Assertions.assertEquals("TRF", paymentInfo.getPmtMtd().name());
        Assertions.assertEquals(LocalDate.now().plusDays(30), paymentInfo.getReqdExctnDt());
        Assertions.assertEquals("DebtorName", paymentInfo.getDbtr().getNm());
        Assertions.assertEquals("NL91ABNA0417164300", paymentInfo.getDbtrAcct().getId().getIBAN());
        Assertions.assertEquals("ABNANL2AXXX", paymentInfo.getDbtrAgt().getFinInstnId().getBIC());
        Assertions.assertEquals(1, paymentInfo.getCdtTrfTxInf().size());
    }

    @Test
    @SneakyThrows
    void buildCreditTransferTransaction_shouldSetFields() {
        // Given

        OfferTransactionInvoiceTenantView transaction1 = mock(OfferTransactionInvoiceTenantView.class);
        when(transaction1.getSupplierName()).thenReturn("CreditorName");
        when(transaction1.getOfferTransaction()).thenReturn(OfferTransaction.builder()
                .amount(BigDecimal.valueOf(200.50))
                .build());

        // When
        CreditTransferTransactionInformation10 tx = ReflectionTestUtils.invokeMethod(sepaService, "buildCreditTransferTransaction", transaction1);

        // Verify
        Assertions.assertNotNull(tx);
        Assertions.assertNotNull(tx.getPmtId().getEndToEndId());
        Assertions.assertEquals("EUR", tx.getAmt().getInstdAmt().getCcy());
        Assertions.assertEquals(BigDecimal.valueOf(200.50), tx.getAmt().getInstdAmt().getValue());
        Assertions.assertEquals("CreditorName", tx.getCdtr().getNm());
    }

    @Test
    void calculateTotalAmount_shouldReturnZeroForEmptyList() {
        BigDecimal result = ReflectionTestUtils.invokeMethod(sepaService, "calculateTotalAmount", List.of());
        Assertions.assertEquals(BigDecimal.ZERO.setScale(2), result);
    }
}

