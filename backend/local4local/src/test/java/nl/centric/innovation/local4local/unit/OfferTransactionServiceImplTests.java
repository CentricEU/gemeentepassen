package nl.centric.innovation.local4local.unit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import lombok.SneakyThrows;
import nl.centric.innovation.local4local.dto.MonthlyTransactionDto;
import nl.centric.innovation.local4local.dto.MonthlyTransactionView;
import nl.centric.innovation.local4local.dto.OfferTransactionInvoiceTenantDto;
import nl.centric.innovation.local4local.dto.OfferTransactionInvoiceTenantView;
import nl.centric.innovation.local4local.dto.OfferTransactionTableDto;
import nl.centric.innovation.local4local.dto.OfferTransactionTableView;
import nl.centric.innovation.local4local.dto.OfferTransactionTenantTableDto;
import nl.centric.innovation.local4local.dto.OfferTransactionTenantTableView;
import nl.centric.innovation.local4local.dto.OfferTransactionsGroupedDto;
import nl.centric.innovation.local4local.dto.OfferTransactionsGroupedView;
import nl.centric.innovation.local4local.dto.WorkingHoursCreateDto;
import nl.centric.innovation.local4local.entity.DiscountCode;
import nl.centric.innovation.local4local.entity.Offer;
import nl.centric.innovation.local4local.entity.OfferTransaction;
import nl.centric.innovation.local4local.entity.Role;
import nl.centric.innovation.local4local.entity.Supplier;
import nl.centric.innovation.local4local.entity.User;
import nl.centric.innovation.local4local.enums.TimeIntervalPeriod;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.exceptions.InvalidDateRangeException;
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
import java.math.BigDecimal;
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
        LocalDateTime startDateTime = LocalDateTime.of(2024, 6, 1, 0, 0);
        LocalDateTime endDateTime = LocalDateTime.of(2024, 6, 30, 23, 59, 59);
        LocalDate startDate = LocalDate.of(2024, 6, 1);
        LocalDate endDate = LocalDate.of(2024, 6, 30);

        // When
        when(principalService.getSupplierId()).thenReturn(supplierId);
        when(offerTransactionRepository.countIntervalTransactionsBySupplierId(eq(supplierId), any(LocalDateTime.class), any(LocalDateTime.class))).thenReturn(5);
        Integer result = offerTransactionService.countIntervalTransactionsBySupplierId(startDate, endDate);

        // Then
        assertEquals(5, result);
        verify(offerTransactionRepository, times(1)).countIntervalTransactionsBySupplierId(eq(supplierId), any(LocalDateTime.class), any(LocalDateTime.class));
    }

    @Test
    void GivenSupplierId_WhenNoTransactionsExist_ThenReturnZero() {
        // Given
        UUID supplierId = UUID.randomUUID();

        LocalDateTime startDate = LocalDateTime.of(2024, 6, 1, 0, 0);
        LocalDateTime endDate = LocalDateTime.of(2024, 6, 30, 23, 59, 59);
        LocalDate startDateN = LocalDate.of(2024, 6, 1);
        LocalDate endDateN = LocalDate.of(2024, 6, 30);

        // When
        when(principalService.getSupplierId()).thenReturn(supplierId);
        when(offerTransactionRepository.countIntervalTransactionsBySupplierId(eq(supplierId), any(LocalDateTime.class), any(LocalDateTime.class))).thenReturn(0);
        Integer result = offerTransactionService.countIntervalTransactionsBySupplierId(startDateN, endDateN);

        // Then
        assertEquals(0, result);
        verify(offerTransactionRepository, times(1)).countIntervalTransactionsBySupplierId(eq(supplierId), any(LocalDateTime.class), any(LocalDateTime.class));
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

        LocalDateTime startDate = LocalDateTime.of(2024, 6, 1, 0, 0);
        LocalDateTime endDate = LocalDateTime.of(2024, 6, 30, 23, 59, 59);
        LocalDate startDateN = LocalDate.of(2024, 6, 1);
        LocalDate endDateN = LocalDate.of(2024, 6, 30);
        int page = 0;
        int size = 10;
        Pageable pageable = PageRequest.of(page, size);

        // Create a mocked projection record
        OfferTransactionTableView transaction = mock(OfferTransactionTableView.class);

        List<OfferTransactionTableView> transactions = List.of(transaction);

        // When
        when(principalService.getSupplierId()).thenReturn(supplierId);
        when(offerTransactionRepository.findTransactionsByInterval(
                eq(supplierId),
                any(LocalDateTime.class),
                any(LocalDateTime.class),
                eq(pageable)))
                .thenReturn(transactions);

        List<OfferTransactionTableView> result =
                offerTransactionService.getTransactionsInterval(startDateN, endDateN, page, size);

        // Then
        assertEquals(transactions, result);
        verify(offerTransactionRepository, times(1)).findTransactionsByInterval(
                eq(supplierId),
                any(LocalDateTime.class),
                any(LocalDateTime.class),
                eq(pageable));
    }

    @Test
    void GivenNoTransactionsExist_WhenGetTransactionsByMonthAndYear_ThenReturnEmptyList() {
        // Given
        UUID supplierId = UUID.fromString("8e3ea9e1-4bf7-4ad7-85d9-ce5c98439cdd");

        LocalDateTime startDate = LocalDateTime.of(2024, 6, 1, 0, 0);
        LocalDateTime endDate = LocalDateTime.of(2024, 6, 30, 23, 59, 59);
        LocalDate startDateN = LocalDate.of(2024, 6, 1);
        LocalDate endDateN = LocalDate.of(2024, 6, 30);
        int page = 0;
        int size = 10;
        Pageable pageable = PageRequest.of(page, size);

        // When
        when(principalService.getSupplierId()).thenReturn(supplierId);
        when(offerTransactionRepository.findTransactionsByInterval(eq(supplierId), any(LocalDateTime.class), any(LocalDateTime.class), eq(pageable))).thenReturn(Collections.emptyList());
        List<OfferTransactionTableView> result = offerTransactionService.getTransactionsInterval(startDateN, endDateN, page, size);

        // Then
        assertTrue(result.isEmpty());
        verify(offerTransactionRepository, times(1)).findTransactionsByInterval(eq(supplierId), any(LocalDateTime.class), any(LocalDateTime.class), eq(pageable));
    }

    @Test
    void GivenTransactionsExistAcrossMonths_WhenGetUserTransactionsGrouped_ThenReturnsGroupedResultWithEmptyMonths() {
        // Given
        UUID userId = UUID.randomUUID();
        LocalDateTime userCreatedDate = LocalDateTime.of(2024, 1, 1, 0, 0);
        User user = new User();
        user.setId(userId);
        user.setCreatedDate(userCreatedDate);

        // Mock projection interface
        OfferTransactionsGroupedView transactionView = Mockito.mock(OfferTransactionsGroupedView.class);
        lenient().when(transactionView.getOfferTitle()).thenReturn("Test 1");
        lenient().when(transactionView.getSupplierName()).thenReturn("Centric");
        lenient().when(transactionView.getAmount()).thenReturn(100.0);
        lenient().when(transactionView.getOfferType()).thenReturn(null); // or some OfferType if needed
        // This string format must match what your service expects/parses
        lenient().when(transactionView.getCreatedDate()).thenReturn("01/03/2024");

        List<OfferTransactionsGroupedView> mockedTransactions = List.of(transactionView);

        when(principalService.getUser()).thenReturn(user);
        when(offerTransactionRepository.findOfferTransactionsForCitizen(
                eq(userId), Mockito.any(Pageable.class)))
                .thenReturn(mockedTransactions);

        // When
        Map<YearMonth, List<OfferTransactionsGroupedView>> result =
                offerTransactionService.getUserTransactionsGrouped(0, 10);

        // Then
        YearMonth start = YearMonth.of(2024, 1);
        YearMonth now = YearMonth.from(LocalDate.now());
        long monthsBetween = ChronoUnit.MONTHS.between(start, now) + 1;

        assertEquals(monthsBetween, result.size());

        assertTrue(result.get(YearMonth.of(2024, 1)).isEmpty());
        assertTrue(result.get(YearMonth.of(2024, 2)).isEmpty());
        assertEquals(1, result.get(YearMonth.of(2024, 3)).size());

        OfferTransactionsGroupedView dtoForMarch = result.get(YearMonth.of(2024, 3)).get(0);
        assertEquals("Test 1", dtoForMarch.getOfferTitle());
        assertEquals("Centric", dtoForMarch.getSupplierName());
        assertEquals(100.0, dtoForMarch.getAmount());
    }

    @Test
    void GivenMonthlyPeriodAndMunicipalityAdmin_WhenGetTransactionStatsForPeriod_ThenReturnsCorrectStats() {
        // Given
        UUID tenantId = UUID.fromString("8e3ea9e1-4bf7-4ad7-85d9-ce5c98439cdd");
        User user = User.builder()
                .role(Role.builder()
                        .name(Role.ROLE_MUNICIPALITY_ADMIN)
                        .build())
                .build();

        when(principalService.getTenantId()).thenReturn(tenantId);
        when(principalService.getUser()).thenReturn(user);

        int currentMonth = LocalDateTime.now().getMonthValue();
        double totalAmount = 200.0;

        MonthlyTransactionView existingStat = mock(MonthlyTransactionView.class);
        when(existingStat.getMonth()).thenReturn(currentMonth);
        when(existingStat.getTotalAmount()).thenReturn(totalAmount);

        when(offerTransactionRepository.sumTransactionsByMonthAndTenantIdSince(eq(tenantId), any(LocalDateTime.class)))
                .thenReturn(List.of(existingStat));

        // When
        List<MonthlyTransactionDto> result =
                offerTransactionService.getTransactionStatsForPeriod(TimeIntervalPeriod.MONTHLY);

        // Then
        assertEquals(1, result.size());
        assertEquals(existingStat.getMonth(), result.get(0).month());
        assertEquals(existingStat.getTotalAmount(), result.get(0).totalAmount());
    }

    @Test
    void GivenQuarterlyPeriodAndMunicipalityAdmin_WhenGetTransactionStatsForPeriod_ThenFillsMissingMonths() {
        // Given
        UUID tenantId = UUID.fromString("8e3ea9e1-4bf7-4ad7-85d9-ce5c98439cdd");
        User user = User.builder()
                .role(Role.builder()
                        .name(Role.ROLE_MUNICIPALITY_ADMIN)
                        .build())
                .build();
        when(principalService.getTenantId()).thenReturn(tenantId);
        when(principalService.getUser()).thenReturn(user);

        int currentMonth = LocalDateTime.now().getMonthValue();

        MonthlyTransactionView transaction = mock(MonthlyTransactionView.class);
        when(transaction.getMonth()).thenReturn(currentMonth);
        when(transaction.getTotalAmount()).thenReturn(150.0);

        when(offerTransactionRepository.sumTransactionsByMonthAndTenantIdSince(eq(tenantId), any(LocalDateTime.class)))
                .thenReturn(List.of(transaction));

        // When
        List<MonthlyTransactionDto> result =
                offerTransactionService.getTransactionStatsForPeriod(TimeIntervalPeriod.QUARTERLY);

        // Then
        Set<Integer> quarterMonths = getExpectedQuarterMonths(LocalDateTime.now());
        assertEquals(quarterMonths.size(), result.size());

        for (MonthlyTransactionDto dto : result) {
            if (dto.month().equals(transaction.getMonth())) {
                assertEquals(transaction.getTotalAmount(), dto.totalAmount());
            } else {
                assertEquals(0.0, dto.totalAmount());
            }
        }
    }

    @Test
    void GivenYearlyPeriodAndMunicipalityAdmin_WhenGetTransactionStatsForPeriod_ThenReturnsAllMonths() {
        // Given
        UUID tenantId = UUID.fromString("8e3ea9e1-4bf7-4ad7-85d9-ce5c98439cdd");
        User user = User.builder()
                .role(Role.builder()
                        .name(Role.ROLE_MUNICIPALITY_ADMIN)
                        .build())
                .build();

        when(principalService.getTenantId()).thenReturn(tenantId);
        when(principalService.getUser()).thenReturn(user);

        MonthlyTransactionView janTransaction = mock(MonthlyTransactionView.class);
        when(janTransaction.getMonth()).thenReturn(1);
        when(janTransaction.getTotalAmount()).thenReturn(500.0);

        MonthlyTransactionView decTransaction = mock(MonthlyTransactionView.class);
        when(decTransaction.getMonth()).thenReturn(12);
        when(decTransaction.getTotalAmount()).thenReturn(800.0);

        when(offerTransactionRepository.sumTransactionsByMonthAndTenantIdSince(eq(tenantId), any(LocalDateTime.class)))
                .thenReturn(List.of(janTransaction, decTransaction));

        // When
        List<MonthlyTransactionDto> result =
                offerTransactionService.getTransactionStatsForPeriod(TimeIntervalPeriod.YEARLY);

        // Then
        assertEquals(12, result.size());

        assertEquals(500.0,
                result.stream()
                        .filter(m -> m.month() == 1)
                        .findFirst()
                        .orElseThrow()
                        .totalAmount());
        assertEquals(800.0,
                result.stream()
                        .filter(m -> m.month() == 12)
                        .findFirst()
                        .orElseThrow()
                        .totalAmount());

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

        int currentMonth = LocalDateTime.now().getMonthValue();
        double totalAmount = 200.0;

        MonthlyTransactionView existingStat = mock(MonthlyTransactionView.class);
        when(existingStat.getMonth()).thenReturn(currentMonth);
        when(existingStat.getTotalAmount()).thenReturn(totalAmount);

        when(offerTransactionRepository.sumTransactionsByMonthAndSupplierIdSince(eq(supplierId), any(LocalDateTime.class)))
                .thenReturn(List.of(existingStat));

        // When
        List<MonthlyTransactionDto> result =
                offerTransactionService.getTransactionStatsForPeriod(TimeIntervalPeriod.MONTHLY);

        // Then
        assertEquals(1, result.size());
        assertEquals(existingStat.getMonth(), result.get(0).month());
        assertEquals(existingStat.getTotalAmount(), result.get(0).totalAmount());
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
        when(principalService.getUser()).thenReturn(user);

        int currentMonth = LocalDateTime.now().getMonthValue();

        MonthlyTransactionView transaction = mock(MonthlyTransactionView.class);
        when(transaction.getMonth()).thenReturn(currentMonth);
        when(transaction.getTotalAmount()).thenReturn(150.0);

        when(offerTransactionRepository.sumTransactionsByMonthAndSupplierIdSince(eq(supplierId), any(LocalDateTime.class)))
                .thenReturn(List.of(transaction));

        // When
        List<MonthlyTransactionDto> result =
                offerTransactionService.getTransactionStatsForPeriod(TimeIntervalPeriod.QUARTERLY);

        // Then
        Set<Integer> quarterMonths = getExpectedQuarterMonths(LocalDateTime.now());
        assertEquals(quarterMonths.size(), result.size());

        for (MonthlyTransactionDto dto : result) {
            if (dto.month().equals(transaction.getMonth())) {
                assertEquals(transaction.getTotalAmount(), dto.totalAmount());
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


        MonthlyTransactionView janTransaction = mock(MonthlyTransactionView.class);
        when(janTransaction.getMonth()).thenReturn(1);
        when(janTransaction.getTotalAmount()).thenReturn(500.0);

        MonthlyTransactionView decTransaction = mock(MonthlyTransactionView.class);
        when(decTransaction.getMonth()).thenReturn(12);
        when(decTransaction.getTotalAmount()).thenReturn(800.0);

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
        UUID tenantId = UUID.fromString("8e3ea9e1-4bf7-4ad7-85d9-ce5c98439cdd");

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
        UUID tenantId = UUID.fromString("8e3ea9e1-4bf7-4ad7-85d9-ce5c98439cdd");

        LocalDateTime startDate = LocalDateTime.of(2024, 6, 1, 0, 0);
        LocalDateTime endDate = LocalDateTime.of(2024, 6, 30, 23, 59, 59);
        LocalDate startDateN = LocalDate.of(2024, 6, 1);
        LocalDate endDateN = LocalDate.of(2024, 6, 30);
        // When
        when(principalService.getTenantId()).thenReturn(tenantId);
        when(offerTransactionRepository.countIntervalTransactionsByTenantId(eq(tenantId), any(LocalDateTime.class), any(LocalDateTime.class))).thenReturn(7);

        // Then
        Integer result = offerTransactionService.countIntervalTransactionsByTenantId(startDateN, endDateN);
        assertEquals(7, result);
        verify(offerTransactionRepository, times(1)).countIntervalTransactionsByTenantId(eq(tenantId), any(LocalDateTime.class), any(LocalDateTime.class));
    }

    @Test
    void GivenTenantIdAndDateRange_WhenGetTransactionsByMonthYearAndTenantId_ThenReturnTransactions() {
        // Given
        UUID tenantId = UUID.fromString("8e3ea9e1-4bf7-4ad7-85d9-ce5c98439cdd");

        LocalDateTime startDate = LocalDateTime.of(2024, 9, 1, 0, 0);
        LocalDateTime endDate = LocalDateTime.of(2024, 9, 30, 23, 59, 59);

        LocalDate startDateN = LocalDate.of(2024, 6, 1);
        LocalDate endDateN = LocalDate.of(2024, 6, 30);

        OfferTransactionInvoiceTenantView view = Mockito.mock(OfferTransactionInvoiceTenantView.class);

        OfferTransaction offer = new OfferTransaction();
        offer.setAmount(BigDecimal.valueOf(100.0));
        offer.setCreatedDate(LocalDateTime.of(2024, 9, 5, 0, 0));

        List<OfferTransactionInvoiceTenantView> transactions = List.of(view);

        // When
        when(principalService.getTenantId()).thenReturn(tenantId);
        when(offerTransactionRepository.findTransactionsBetweenDatesByTenantId(eq(tenantId), any(LocalDateTime.class), any(LocalDateTime.class))).thenReturn(transactions);

        // Then
        List<OfferTransactionInvoiceTenantView> result = offerTransactionService.getTransactionsByIntervalAndTenantId(startDateN, endDateN);
        assertEquals(transactions, result);
        verify(offerTransactionRepository, times(1)).findTransactionsBetweenDatesByTenantId(eq(tenantId), any(LocalDateTime.class), any(LocalDateTime.class));
    }

    @Test
    void GivenTenantIdIntervalPageable_WhenGetTransactionsByIntervalAndTenantId_ThenReturnTransactions()
            throws InvalidDateRangeException {
        // Given
        UUID tenantId = UUID.fromString("8e3ea9e1-4bf7-4ad7-85d9-ce5c98439cdd");

        LocalDate startDateN = LocalDate.of(2024, 6, 1);
        LocalDate endDateN = LocalDate.of(2024, 6, 30);

        int page = 0;
        int size = 5;
        Pageable pageable = PageRequest.of(page, size);

        // Mock projection returned by repository (MUST be OfferTransactionTenantTableView)
        OfferTransactionTenantTableView transactionView = mock(OfferTransactionTenantTableView.class);
        when(transactionView.getPassNumber()).thenReturn("12345");
        when(transactionView.getCitizenName()).thenReturn("John Doe");
        when(transactionView.getAmount()).thenReturn(BigDecimal.valueOf(100.0));
        when(transactionView.getCreatedDate()).thenReturn("01/05/2023");
        when(transactionView.getCreatedTime()).thenReturn("10:20");

        List<OfferTransactionTenantTableView> transactions = List.of(transactionView);

        // When
        when(principalService.getTenantId()).thenReturn(tenantId);
        when(offerTransactionRepository.findTransactionsByIntervalAndTenantId(
                eq(tenantId),
                any(LocalDateTime.class),
                any(LocalDateTime.class),
                eq(pageable)))
                .thenReturn(transactions);

        // Then
        List<OfferTransactionTenantTableView> result =
                offerTransactionService.getTransactionsByIntervalAndTenantId(
                        startDateN, endDateN, page, size, null);

        assertEquals(1, result.size());
        OfferTransactionTenantTableView first = result.get(0);

        assertEquals("12345", first.getPassNumber());
        assertEquals("John Doe", first.getCitizenName());
        assertEquals(BigDecimal.valueOf(100.0), first.getAmount());
        assertEquals("01/05/2023", first.getCreatedDate());
        assertEquals("10:20", first.getCreatedTime());

        verify(offerTransactionRepository, times(1)).findTransactionsByIntervalAndTenantId(
                eq(tenantId),
                any(LocalDateTime.class),
                any(LocalDateTime.class),
                eq(pageable));
    }

    @Test
    @SneakyThrows
    public void GivenInvalidInterval_WhenGetTransactionsByIntervalAndTenantId_ThenShouldThrowInvalidDateRangeException() {
        UUID tenantId = UUID.fromString("8e3ea9e1-4bf7-4ad7-85d9-ce5c98439cdd");

        LocalDate endDateN = LocalDate.of(2024, 6, 1);
        LocalDate startDateN = LocalDate.of(2024, 6, 30);

        int page = 0;
        int size = 5;
        // When
        assertThrows(InvalidDateRangeException.class, () -> offerTransactionService.getTransactionsByIntervalAndTenantId(startDateN, endDateN, page, size, null));
    }

    private Set<Integer> getExpectedQuarterMonths(LocalDateTime now) {
        LocalDateTime startOfQuarter = now.withMonth(((now.getMonthValue() - 1) / 3) * 3 + 1).withDayOfMonth(1);
        return IntStream.rangeClosed(0, 3)
                .mapToObj(i -> startOfQuarter.plusMonths(i).getMonthValue())
                .collect(Collectors.toSet());
    }
}
