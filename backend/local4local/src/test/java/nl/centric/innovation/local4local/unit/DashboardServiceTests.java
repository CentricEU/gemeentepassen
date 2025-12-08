package nl.centric.innovation.local4local.unit;

import lombok.SneakyThrows;
import nl.centric.innovation.local4local.dto.DashboardCountDto;
import nl.centric.innovation.local4local.dto.OfferStatisticsDto;
import nl.centric.innovation.local4local.enums.SupplierStatusEnum;
import nl.centric.innovation.local4local.enums.TimeIntervalPeriod;
import nl.centric.innovation.local4local.repository.DiscountCodeRepository;
import nl.centric.innovation.local4local.service.impl.DashboardService;
import nl.centric.innovation.local4local.service.impl.OfferTransactionService;
import nl.centric.innovation.local4local.service.impl.PassholderService;
import nl.centric.innovation.local4local.service.impl.PrincipalService;
import nl.centric.innovation.local4local.service.impl.SupplierService;
import nl.centric.innovation.local4local.util.DateUtils;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTests {

    @InjectMocks
    private DashboardService dashboardService;
    @Mock
    private OfferTransactionService offerTransactionService;
    @Mock
    private PrincipalService principalService;
    @Mock
    private SupplierService supplierService;
    @Mock
    private PassholderService passholderService;
    @Mock
    private DiscountCodeRepository discountCodeRepository;

    @Test
    @SneakyThrows
    void GivenValidTenantIdAndStatuses_WhenGetDashboardCounts_ThenReturnsCorrectCounts() {
        // Given
        UUID tenantId = UUID.randomUUID();
        Set<SupplierStatusEnum> statuses = EnumSet.of(SupplierStatusEnum.APPROVED);
        int expectedPassholders = 10;
        int expectedSuppliers = 5;
        int expectedTransactions = 7;

        when(principalService.getTenantId()).thenReturn(tenantId);
        when(passholderService.countAll()).thenReturn(expectedPassholders);
        when(supplierService.countAllByTenantIdAndStatus(tenantId, statuses)).thenReturn(expectedSuppliers);
        when(offerTransactionService.countAllTransactionsByTenantId()).thenReturn(expectedTransactions);

        // When
        DashboardCountDto result = dashboardService.getDashboardCounts(statuses);

        // Then
        assertEquals(expectedPassholders, result.passholdersCount());
        assertEquals(expectedSuppliers, result.suppliersCount());
        assertEquals(expectedTransactions, result.transactionsCount());

        verify(principalService).getTenantId();
        verify(passholderService).countAll();
        verify(supplierService).countAllByTenantIdAndStatus(tenantId, statuses);
        verify(offerTransactionService).countAllTransactionsByTenantId();
    }

    @Test
    @SneakyThrows
    void GivenValidIntervalPeriod_WhenGetUsedOfferStatistics_ThenReturnsCorrectStatistics() {
        // Given
        UUID supplierId = UUID.randomUUID();
        LocalDateTime createdDate = DateUtils.calculateQuarterlyStartDate(LocalDateTime.now());
        List<OfferStatisticsDto> expectedStatistics = List.of(
                new OfferStatisticsDto(2, "Percentage", 10L),
                new OfferStatisticsDto(1, "BOGO", 20L)
        );

        when(principalService.getSupplierId()).thenReturn(supplierId);
        when(discountCodeRepository.findCitizenCountByOfferTypeAndTenantId(supplierId, createdDate))
                .thenReturn(expectedStatistics);

        // When
        List<OfferStatisticsDto> result = dashboardService.getUsedOfferStatistics(TimeIntervalPeriod.QUARTERLY);

        // Then
        assertEquals(expectedStatistics, result);

        verify(principalService).getSupplierId();
        verify(discountCodeRepository).findCitizenCountByOfferTypeAndTenantId(supplierId, createdDate);
    }
}

