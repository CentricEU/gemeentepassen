package nl.centric.innovation.local4local.service.impl;


import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.DashboardCountDto;
import nl.centric.innovation.local4local.dto.MonthlyTransactionDto;
import nl.centric.innovation.local4local.dto.OfferStatisticsDto;
import nl.centric.innovation.local4local.enums.SupplierStatusEnum;
import nl.centric.innovation.local4local.enums.TimeIntervalPeriod;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.repository.DiscountCodeRepository;
import nl.centric.innovation.local4local.util.DateUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final SupplierService supplierService;
    private final PassholderService passholderService;
    private final PrincipalService principalService;
    private final OfferTransactionService offerTransactionService;

    private final DiscountCodeRepository discountCodeRepository;

    public DashboardCountDto getDashboardCounts(Set<SupplierStatusEnum> statuses) throws DtoValidateNotFoundException {
        return DashboardCountDto.builder()
                .passholdersCount(passholderService.countAll())
                .suppliersCount(supplierService.countAllByTenantIdAndStatus(getTenantId(), statuses))
                .transactionsCount(offerTransactionService.countAllTransactionsByTenantId())
                .build();
    }

    public List<MonthlyTransactionDto> getMonthlyTransactionStats(TimeIntervalPeriod period) {
        return offerTransactionService.getTransactionStatsForPeriod(period);
    }

    public List<OfferStatisticsDto> getUsedOfferStatistics(TimeIntervalPeriod intervalPeriod) {
        LocalDateTime createdDate = DateUtils.calculateCreatedDate(intervalPeriod);
        return discountCodeRepository.findCitizenCountByOfferTypeAndTenantId(
                principalService.getSupplierId(), createdDate
        );
    }

    private UUID getTenantId() {
        return principalService.getTenantId();
    }

}
