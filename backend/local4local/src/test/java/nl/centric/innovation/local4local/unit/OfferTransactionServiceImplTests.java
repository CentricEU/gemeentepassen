package nl.centric.innovation.local4local.unit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import lombok.SneakyThrows;
import nl.centric.innovation.local4local.dto.MonthlyTransactionDto;
import nl.centric.innovation.local4local.dto.OfferTransactionInvoiceTenantDto;
import nl.centric.innovation.local4local.dto.OfferTransactionTableDto;
import nl.centric.innovation.local4local.dto.OfferTransactionTenantTableDto;
import nl.centric.innovation.local4local.dto.OfferTransactionsGroupedDto;
import nl.centric.innovation.local4local.entity.DiscountCode;
import nl.centric.innovation.local4local.entity.Offer;
import nl.centric.innovation.local4local.entity.OfferTransaction;
import nl.centric.innovation.local4local.entity.Role;
import nl.centric.innovation.local4local.entity.User;
import nl.centric.innovation.local4local.enums.TimeIntervalPeriod;
import nl.centric.innovation.local4local.service.impl.OfferTransactionService;

import nl.centric.innovation.local4local.service.impl.PrincipalService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import nl.centric.innovation.local4local.dto.TransactionDetailsDto;
import nl.centric.innovation.local4local.repository.OfferTransactionRepository;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.lang.reflect.Method;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@ExtendWith(MockitoExtension.class)
class OfferTransactionServiceImplTests {

    @Mock
    private OfferTransactionRepository offerTransactionRepository;

    @InjectMocks
    private OfferTransactionService offerTransactionService;

    @Mock
    private DiscountCode discountCode;

    @Mock
    private Offer offer;

    @Mock
    private PrincipalService principalService;

    @Test
    void GivenSaveTransaction_WhenCalled_ThenVerifySave() {
        offerTransactionService.saveTransaction(discountCode, 0.0, LocalDateTime.now());
        // Verify
        verify(offerTransactionRepository, times(1)).save(any(OfferTransaction.class));
    }

    @Test
    void GivenOfferIdAndCitizenId_WhenGetLastOfferValidationForCitizen_ThenReturnResult() {
        // Given
        UUID offerId = UUID.randomUUID();
        UUID citizenId = UUID.randomUUID();
        OfferTransaction mockTransaction = new OfferTransaction();
        when(offerTransactionRepository.findFirstByDiscountCode_UserIdAndDiscountCode_OfferIdOrderByCreatedDateDesc(citizenId, offerId))
                .thenReturn(Optional.of(mockTransaction));

        // When
        Optional<OfferTransaction> result = offerTransactionService.getLastOfferValidationForCitizen(offerId, citizenId);

        // Then
        assertTrue(result.isPresent());
        assertEquals(mockTransaction, result.get());
    }

    @Test
    void GivenValidTransactions_WhenGetAllValidTransactions_ThenReturnList() {
        // Given
        Offer offer = new Offer();
        offer.setId(UUID.randomUUID());
        DiscountCode discountCode = new DiscountCode();
        discountCode.setOffer(offer);
        discountCode.setCode("12345");

        OfferTransaction transaction1 = new OfferTransaction();
        transaction1.setDiscountCode(discountCode);
        transaction1.setCreatedDate(LocalDateTime.now());

        OfferTransaction transaction2 = new OfferTransaction();
        transaction2.setDiscountCode(discountCode);
        transaction2.setCreatedDate(LocalDateTime.now());
        UUID supplierId = UUID.randomUUID();

        // When
        when(principalService.getSupplierId()).thenReturn(supplierId);
        List<OfferTransaction> transactions = Arrays.asList(transaction1, transaction2);
        when(offerTransactionRepository.findAllByDiscountCode_Offer_SupplierIdOrderByCreatedDateDesc(supplierId)).thenReturn(transactions);

        // Then
        List<TransactionDetailsDto> result = offerTransactionService.getAllValidTransactions();

        assertEquals(2, result.size());
        verify(offerTransactionRepository, times(1)).findAllByDiscountCode_Offer_SupplierIdOrderByCreatedDateDesc(supplierId);
    }

    @SneakyThrows
    @Test
    void GivenOfferTransaction_WhenConvertToTransactionDetailsDto_ThenReturnDto() {
        // Given
        DiscountCode mockCode = mock(DiscountCode.class);
        when(mockCode.getCode()).thenReturn("CODE123");

        OfferTransaction transaction = new OfferTransaction();
        LocalDateTime now = LocalDateTime.now();
        transaction.setCreatedDate(now);
        transaction.setDiscountCode(mockCode);

        Method convertToTransactionDetailsDtoMethod = OfferTransactionService.class.getDeclaredMethod("convertToTransactionDetailsDto", OfferTransaction.class);
        convertToTransactionDetailsDtoMethod.setAccessible(true);

        // When
        TransactionDetailsDto dto = (TransactionDetailsDto) convertToTransactionDetailsDtoMethod.invoke(offerTransactionService, transaction);

        // Then
        assertEquals("CODE123", dto.code());
        assertEquals(now.toLocalTime().truncatedTo(ChronoUnit.MINUTES).toString(), dto.time());
    }

    @Test
    void GivenSupplierId_WhenTransactionsExist_ThenReturnCorrectCount() {
        // Given
        UUID supplierId = UUID.randomUUID();
        Integer month = 11;
        Integer year = 2024;

        // When
        when(principalService.getSupplierId()).thenReturn(supplierId);
        when(offerTransactionRepository.countMonthYearTransactionsBySupplierId(supplierId, month, year)).thenReturn(5);
        Integer result = offerTransactionService.countMonthYearTransactionsBySupplierId(month, year);

        // Then
        assertEquals(5, result);
        verify(offerTransactionRepository, times(1)).countMonthYearTransactionsBySupplierId(supplierId, month, year);
    }

    @Test
    void GivenSupplierId_WhenNoTransactionsExist_ThenReturnZero() {
        // Given
        UUID supplierId = UUID.randomUUID();
        Integer month = 11;
        Integer year = 2024;

        // When
        when(principalService.getSupplierId()).thenReturn(supplierId);
        when(offerTransactionRepository.countMonthYearTransactionsBySupplierId(supplierId, month, year)).thenReturn(0);
        Integer result = offerTransactionService.countMonthYearTransactionsBySupplierId(month, year);

        // Then
        assertEquals(0, result);
        verify(offerTransactionRepository, times(1)).countMonthYearTransactionsBySupplierId(supplierId, month, year);
    }

    @Test
    void GivenTransactionsExist_WhenGetDistinctDates_ThenReturnDistinctYears() {
        // Given
        List<Integer> distinctYears = Arrays.asList(2021, 2022, 2023);
        UUID supplierId = UUID.randomUUID();

        // When
        when(principalService.getSupplierId()).thenReturn(supplierId);
        when(offerTransactionRepository.findDistinctYearByCreatedDateDesc(supplierId)).thenReturn(distinctYears);

        // Then
        List<Integer> result = offerTransactionService.getDistinctYearsForTransactionsBySupplierId();

        assertEquals(distinctYears, result);
        verify(offerTransactionRepository, times(1)).findDistinctYearByCreatedDateDesc(supplierId);
    }

    @Test
    void GivenNoTransactionsExist_WhenGetDistinctDates_ThenReturnEmptyList() {
        // Given
        UUID supplierId = UUID.randomUUID();

        // When
        when(principalService.getSupplierId()).thenReturn(supplierId);
        when(offerTransactionRepository.findDistinctYearByCreatedDateDesc(supplierId)).thenReturn(Collections.emptyList());

        // Then
        List<Integer> result = offerTransactionService.getDistinctYearsForTransactionsBySupplierId();

        assertTrue(result.isEmpty());
        verify(offerTransactionRepository, times(1)).findDistinctYearByCreatedDateDesc(supplierId);
    }

    @Test
    void GivenSupplierId_WhenCountAllTransactionsBySupplierId_ThenReturnCorrectCount() {
        // Given
        UUID supplierId = UUID.randomUUID();

        // When
        when(principalService.getSupplierId()).thenReturn(supplierId);
        when(offerTransactionRepository.countByDiscountCodeOfferSupplierId(supplierId)).thenReturn(10);
        Integer result = offerTransactionService.countAllTransactionsBySupplierId();

        // Then
        assertEquals(10, result);
        verify(offerTransactionRepository, times(1)).countByDiscountCodeOfferSupplierId(supplierId);
    }

    @Test
    void GiveNoTransactionsExist_WhenCountAllTransactionsBySupplierId_ThenReturnZero() {
        // Given
        UUID supplierId = UUID.randomUUID();

        // When
        when(principalService.getSupplierId()).thenReturn(supplierId);
        when(offerTransactionRepository.countByDiscountCodeOfferSupplierId(supplierId)).thenReturn(0);
        Integer result = offerTransactionService.countAllTransactionsBySupplierId();

        // Then
        assertEquals(0, result);
        verify(offerTransactionRepository, times(1)).countByDiscountCodeOfferSupplierId(supplierId);
    }

    @Test
    void GivenValidMonthYearAndPageable_WhenGetTransactionsByMonthAndYear_ThenReturnTransactions() {
        // Given
        UUID supplierId = UUID.randomUUID();
        int month = 5;
        int year = 2023;
        int page = 0;
        int size = 10;
        Pageable pageable = PageRequest.of(page, size);
        List<OfferTransactionTableDto> transactions = Arrays.asList(new OfferTransactionTableDto("12345", "John Doe", 100.0, "01/05/2023", "10:20"));

        // When
        when(principalService.getSupplierId()).thenReturn(supplierId);
        when(offerTransactionRepository.findTransactionsByMonthAndYear(supplierId, month, year, pageable)).thenReturn(transactions);
        List<OfferTransactionTableDto> result = offerTransactionService.getTransactionsByMonthAndYear(month, year, page, size);

        // Then
        assertEquals(transactions, result);
        verify(offerTransactionRepository, times(1)).findTransactionsByMonthAndYear(supplierId, month, year, pageable);
    }

    @Test
    void GivenNoTransactionsExist_WhenGetTransactionsByMonthAndYear_ThenReturnEmptyList() {
        // Given
        UUID supplierId = UUID.randomUUID();
        int month = 5;
        int year = 2023;
        int page = 0;
        int size = 10;
        Pageable pageable = PageRequest.of(page, size);

        // When
        when(principalService.getSupplierId()).thenReturn(supplierId);
        when(offerTransactionRepository.findTransactionsByMonthAndYear(supplierId, month, year, pageable)).thenReturn(Collections.emptyList());
        List<OfferTransactionTableDto> result = offerTransactionService.getTransactionsByMonthAndYear(month, year, page, size);

        // Then
        assertTrue(result.isEmpty());
        verify(offerTransactionRepository, times(1)).findTransactionsByMonthAndYear(supplierId, month, year, pageable);
    }

    @Test
    void GivenTransactionsExistAcrossMonths_WhenGetUserTransactionsGrouped_ThenReturnsGroupedResultWithEmptyMonths() {
        // Given
        UUID userId = UUID.randomUUID();
        LocalDateTime userCreatedDate = LocalDateTime.of(2024, 1, 1, 0, 0);
        User user = new User();
        user.setId(userId);
        user.setCreatedDate(userCreatedDate);

        OfferTransactionsGroupedDto transaction1 = OfferTransactionsGroupedDto.builder()
                .offerTitle("Test 1")
                .supplierName("Centric")
                .amount(100.0)
                .offerType(null)
                .createdDate("01/03/2024")
                .build();

        List<OfferTransactionsGroupedDto> mockedTransactions = List.of(transaction1);

        when(principalService.getUser()).thenReturn(user);
        when(offerTransactionRepository.findOfferTransactionsForCitizen(eq(userId), Mockito.any(Pageable.class)))
                .thenReturn(mockedTransactions);

        // When
        Map<YearMonth, List<OfferTransactionsGroupedDto>> result = offerTransactionService.getUserTransactionsGrouped(0, 10);

        // Then
        assertEquals(ChronoUnit.MONTHS.between(YearMonth.of(2024, 1), YearMonth.from(LocalDate.now())) + 1, result.size());
        assertTrue(result.get(YearMonth.of(2024, 1)).isEmpty());
        assertTrue(result.get(YearMonth.of(2024, 2)).isEmpty());
        assertEquals(1, result.get(YearMonth.of(2024, 3)).size());
    }

    @Test
    void GivenMonthlyPeriodAndMunicipalityAdmin_WhenGetTransactionStatsForPeriod_ThenReturnsCorrectStats() {
        // Given
        UUID tenantId = UUID.randomUUID();
        User user = User.builder()
                .role(Role.builder()
                        .name(Role.ROLE_MUNICIPALITY_ADMIN)
                        .build())
                .build();

        when(principalService.getTenantId()).thenReturn(tenantId);
        when(principalService.getUser()).thenReturn(user);

        MonthlyTransactionDto existingStat = new MonthlyTransactionDto(LocalDateTime.now().getMonthValue(), 200.0);
        when(offerTransactionRepository.sumTransactionsByMonthAndTenantIdSince(eq(tenantId), any(LocalDateTime.class)))
                .thenReturn(List.of(existingStat));

        // When
        List<MonthlyTransactionDto> result = offerTransactionService.getTransactionStatsForPeriod(TimeIntervalPeriod.MONTHLY);

        // Then
        assertEquals(1, result.size());
        assertEquals(existingStat.month(), result.get(0).month());
        assertEquals(existingStat.totalAmount(), result.get(0).totalAmount());
    }

    @Test
    void GivenQuarterlyPeriodAndMunicipalityAdmin_WhenGetTransactionStatsForPeriod_ThenFillsMissingMonths() {
        // Given
        UUID tenantId = UUID.randomUUID();
        User user = User.builder()
                .role(Role.builder()
                        .name(Role.ROLE_MUNICIPALITY_ADMIN)
                        .build())
                .build();
        when(principalService.getTenantId()).thenReturn(tenantId);

        MonthlyTransactionDto transaction = new MonthlyTransactionDto(LocalDateTime.now().getMonthValue(), 150.0);
        when(principalService.getUser()).thenReturn(user);
        when(offerTransactionRepository.sumTransactionsByMonthAndTenantIdSince(eq(tenantId), any(LocalDateTime.class)))
                .thenReturn(List.of(transaction));

        // When
        List<MonthlyTransactionDto> result = offerTransactionService.getTransactionStatsForPeriod(TimeIntervalPeriod.QUARTERLY);

        // Then
        Set<Integer> quarterMonths = getExpectedQuarterMonths(LocalDateTime.now());
        assertEquals(quarterMonths.size(), result.size());

        for (MonthlyTransactionDto dto : result) {
            if (dto.month().equals(transaction.month())) {
                assertEquals(transaction.totalAmount(), dto.totalAmount());
            } else {
                assertEquals(0.0, dto.totalAmount());
            }
        }
    }

    @Test
    void GivenYearlyPeriodAndMunicipalityAdmin_WhenGetTransactionStatsForPeriod_ThenReturnsAllMonths() {
        // Given
        UUID tenantId = UUID.randomUUID();
        User user = User.builder()
                .role(Role.builder()
                        .name(Role.ROLE_MUNICIPALITY_ADMIN)
                        .build())
                .build();

        when(principalService.getTenantId()).thenReturn(tenantId);
        when(principalService.getUser()).thenReturn(user);

        MonthlyTransactionDto janTransaction = new MonthlyTransactionDto(1, 500.0);
        MonthlyTransactionDto decTransaction = new MonthlyTransactionDto(12, 800.0);

        when(offerTransactionRepository.sumTransactionsByMonthAndTenantIdSince(eq(tenantId), any(LocalDateTime.class)))
                .thenReturn(List.of(janTransaction, decTransaction));

        // When
        List<MonthlyTransactionDto> result = offerTransactionService.getTransactionStatsForPeriod(TimeIntervalPeriod.YEARLY);

        // Then
        assertEquals(12, result.size());

        assertEquals(500.0, result.stream().filter(m -> m.month() == 1).findFirst().orElseThrow().totalAmount());
        assertEquals(800.0, result.stream().filter(m -> m.month() == 12).findFirst().orElseThrow().totalAmount());

        // All other months should have 0.0
        for (MonthlyTransactionDto dto : result) {
            if (dto.month() != 1 && dto.month() != 12) {
                assertEquals(0.0, dto.totalAmount());
            }
        }
    }

    @Test
    void GivenMonthlyPeriodAndSupplier_WhenGetTransactionStatsForPeriod_ThenReturnsCorrectStats() {
        // Given
        UUID supplierId = UUID.randomUUID();
        User user = User.builder()
                .role(Role.builder()
                        .name(Role.ROLE_SUPPLIER)
                        .build())
                .build();

        when(principalService.getUser()).thenReturn(user);
        when(principalService.getSupplierId()).thenReturn(supplierId);

        MonthlyTransactionDto existingStat = new MonthlyTransactionDto(LocalDateTime.now().getMonthValue(), 200.0);
        when(offerTransactionRepository.sumTransactionsByMonthAndSupplierIdSince(eq(supplierId), any(LocalDateTime.class)))
                .thenReturn(List.of(existingStat));

        // When
        List<MonthlyTransactionDto> result = offerTransactionService.getTransactionStatsForPeriod(TimeIntervalPeriod.MONTHLY);

        // Then
        assertEquals(1, result.size());
        assertEquals(existingStat.month(), result.get(0).month());
        assertEquals(existingStat.totalAmount(), result.get(0).totalAmount());
    }

    @Test
    void GivenQuarterlyPeriodAndSupplier_WhenGetTransactionStatsForPeriod_ThenFillsMissingMonths() {
        // Given
        UUID supplierId = UUID.randomUUID();
        User user = User.builder()
                .role(Role.builder()
                        .name(Role.ROLE_SUPPLIER)
                        .build())
                .build();
        when(principalService.getSupplierId()).thenReturn(supplierId);

        MonthlyTransactionDto transaction = new MonthlyTransactionDto(LocalDateTime.now().getMonthValue(), 150.0);
        when(principalService.getUser()).thenReturn(user);
        when(offerTransactionRepository.sumTransactionsByMonthAndSupplierIdSince(eq(supplierId), any(LocalDateTime.class)))
                .thenReturn(List.of(transaction));

        // When
        List<MonthlyTransactionDto> result = offerTransactionService.getTransactionStatsForPeriod(TimeIntervalPeriod.QUARTERLY);

        // Then
        Set<Integer> quarterMonths = getExpectedQuarterMonths(LocalDateTime.now());
        assertEquals(quarterMonths.size(), result.size());

        for (MonthlyTransactionDto dto : result) {
            if (dto.month().equals(transaction.month())) {
                assertEquals(transaction.totalAmount(), dto.totalAmount());
            } else {
                assertEquals(0.0, dto.totalAmount());
            }
        }
    }

    @Test
    void GivenYearlyPeriodAndSupplier_WhenGetTransactionStatsForPeriod_ThenReturnsAllMonths() {
        // Given
        UUID supplierId = UUID.randomUUID();
        User user = User.builder()
                .role(Role.builder()
                        .name(Role.ROLE_SUPPLIER)
                        .build())
                .build();

        when(principalService.getUser()).thenReturn(user);
        when(principalService.getSupplierId()).thenReturn(supplierId);

        MonthlyTransactionDto janTransaction = new MonthlyTransactionDto(1, 500.0);
        MonthlyTransactionDto decTransaction = new MonthlyTransactionDto(12, 800.0);

        when(offerTransactionRepository.sumTransactionsByMonthAndSupplierIdSince(eq(supplierId), any(LocalDateTime.class)))
                .thenReturn(List.of(janTransaction, decTransaction));

        // When
        List<MonthlyTransactionDto> result = offerTransactionService.getTransactionStatsForPeriod(TimeIntervalPeriod.YEARLY);

        // Then
        assertEquals(12, result.size());

        assertEquals(500.0, result.stream().filter(m -> m.month() == 1).findFirst().orElseThrow().totalAmount());
        assertEquals(800.0, result.stream().filter(m -> m.month() == 12).findFirst().orElseThrow().totalAmount());

        // All other months should have 0.0
        for (MonthlyTransactionDto dto : result) {
            if (dto.month() != 1 && dto.month() != 12) {
                assertEquals(0.0, dto.totalAmount());
            }
        }
    }

    @Test
    void GivenTenantId_WhenGetDistinctYearsForTransactionsByTenantId_ThenReturnDistinctYears() {
        // Given
        List<Integer> distinctYears = Arrays.asList(2022, 2023, 2024);
        UUID tenantId = UUID.randomUUID();

        // When
        when(principalService.getTenantId()).thenReturn(tenantId);
        when(offerTransactionRepository.findDistinctYearByTenantIdAndCreatedDateDesc(tenantId)).thenReturn(distinctYears);

        // Then
        List<Integer> result = offerTransactionService.getDistinctYearsForTransactionsByTenantId();
        assertEquals(distinctYears, result);
        verify(offerTransactionRepository, times(1)).findDistinctYearByTenantIdAndCreatedDateDesc(tenantId);
    }

    @Test
    void GivenTenantId_WhenCountMonthYearTransactionsByTenantId_ThenReturnCorrectCount() {
        // Given
        UUID tenantId = UUID.randomUUID();
        int month = 6;
        int year = 2024;

        // When
        when(principalService.getTenantId()).thenReturn(tenantId);
        when(offerTransactionRepository.countMonthYearTransactionsByTenantId(tenantId, month, year)).thenReturn(7);

        // Then
        Integer result = offerTransactionService.countMonthYearTransactionsByTenantId(month, year);
        assertEquals(7, result);
        verify(offerTransactionRepository, times(1)).countMonthYearTransactionsByTenantId(tenantId, month, year);
    }

    @Test
    void GivenTenantIdAndDateRange_WhenGetTransactionsByMonthYearAndTenantId_ThenReturnTransactions() {
        // Given
        UUID tenantId = UUID.randomUUID();
        LocalDate startDate = LocalDate.of(2024, 9, 1);
        LocalDate endDate = LocalDate.of(2024, 9, 30);
        LocalDateTime endOfDay = endDate.atStartOfDay().plusDays(1).minusNanos(1);
        List<OfferTransactionInvoiceTenantDto> transactions = Arrays.asList(
                OfferTransactionInvoiceTenantDto.builder()
                        .supplierIban("NL55INGB0001234567")
                        .passNumber("PASS123")
                        .amount(100.0)
                        .acceptedBenefit("Benefit A")
                        .createdDate("2024-09-05")
                        .build()
        );

        // When
        when(principalService.getTenantId()).thenReturn(tenantId);
        when(offerTransactionRepository.findTransactionsBetweenDatesByTenantId(tenantId, startDate.atStartOfDay(), endOfDay)).thenReturn(transactions);

        // Then
        List<OfferTransactionInvoiceTenantDto> result = offerTransactionService.getTransactionsByMonthYearAndTenantId(startDate, endDate);
        assertEquals(transactions, result);
        verify(offerTransactionRepository, times(1)).findTransactionsBetweenDatesByTenantId(tenantId, startDate.atStartOfDay(), endOfDay);
    }

    @Test
    void GivenTenantIdMonthYearPageable_WhenGetTransactionsByMonthYearAndTenantId_ThenReturnTransactions() {
        // Given
        UUID tenantId = UUID.randomUUID();
        int month = 6;
        int year = 2024;
        int page = 0;
        int size = 5;
        Pageable pageable = PageRequest.of(page, size);
        List<OfferTransactionTenantTableDto> transactions = Arrays.asList(
                new OfferTransactionTenantTableDto("12345", "John Doe", 100.0, "Supplier Name" , "Benefit","01/06/2024", "10:00")
        );

        // When
        when(principalService.getTenantId()).thenReturn(tenantId);
        when(offerTransactionRepository.findTransactionsByMonthYearAndTenantId(tenantId, month, year, pageable)).thenReturn(transactions);

        // Then
        List<OfferTransactionTenantTableDto> result = offerTransactionService.getTransactionsByMonthYearAndTenantId(month, year, page, size);
        assertEquals(transactions, result);
        verify(offerTransactionRepository, times(1)).findTransactionsByMonthYearAndTenantId(tenantId, month, year, pageable);
    }

    private Set<Integer> getExpectedQuarterMonths(LocalDateTime now) {
        LocalDateTime startOfQuarter = now.withMonth(((now.getMonthValue() - 1) / 3) * 3 + 1).withDayOfMonth(1);
        return IntStream.rangeClosed(0, 3)
                .mapToObj(i -> startOfQuarter.plusMonths(i).getMonthValue())
                .collect(Collectors.toSet());
    }
}
