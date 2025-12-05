package nl.centric.innovation.local4local.unit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import lombok.SneakyThrows;
import nl.centric.innovation.local4local.dto.OfferTransactionTableDto;
import nl.centric.innovation.local4local.entity.DiscountCode;
import nl.centric.innovation.local4local.entity.Offer;
import nl.centric.innovation.local4local.entity.OfferTransaction;
import nl.centric.innovation.local4local.service.impl.OfferTransactionService;

import nl.centric.innovation.local4local.service.impl.PrincipalService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import nl.centric.innovation.local4local.dto.TransactionDetailsDto;
import nl.centric.innovation.local4local.repository.OfferTransactionRepository;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.lang.reflect.Method;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

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
        // Given
        when(discountCode.getOffer()).thenReturn(offer);
        when(offer.getAmount()).thenReturn(100.0);

        // When
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

}
