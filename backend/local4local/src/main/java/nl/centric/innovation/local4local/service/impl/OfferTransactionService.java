package nl.centric.innovation.local4local.service.impl;

import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.MonthlyTransactionDto;
import nl.centric.innovation.local4local.dto.MonthlyTransactionView;
import nl.centric.innovation.local4local.dto.OfferTransactionInvoiceDto;
import nl.centric.innovation.local4local.dto.OfferTransactionInvoiceTenantDto;
import nl.centric.innovation.local4local.dto.OfferTransactionInvoiceTenantView;
import nl.centric.innovation.local4local.dto.OfferTransactionTableDto;
import nl.centric.innovation.local4local.dto.OfferTransactionTableView;
import nl.centric.innovation.local4local.dto.OfferTransactionTenantTableDto;
import nl.centric.innovation.local4local.dto.OfferTransactionTenantTableView;
import nl.centric.innovation.local4local.dto.OfferTransactionsGroupedDto;
import nl.centric.innovation.local4local.dto.OfferTransactionsGroupedView;
import nl.centric.innovation.local4local.dto.TransactionDetailsDto;
import nl.centric.innovation.local4local.entity.DiscountCode;
import nl.centric.innovation.local4local.entity.OfferTransaction;
import nl.centric.innovation.local4local.entity.Role;
import nl.centric.innovation.local4local.enums.TimeIntervalPeriod;
import nl.centric.innovation.local4local.exceptions.InvalidDateRangeException;
import nl.centric.innovation.local4local.repository.OfferTransactionRepository;
import nl.centric.innovation.local4local.util.CommonUtils;
import nl.centric.innovation.local4local.util.DateUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;

import static nl.centric.innovation.local4local.util.DateUtils.getDefaultDateTimeFormatter;

@Service
@RequiredArgsConstructor
@PropertySource({"classpath:errorcodes.properties"})
public class OfferTransactionService {

    private final OfferTransactionRepository offerTransactionRepository;
    private final PrincipalService principalService;

    @Value("${error.general.availability}")
    private String errorGeneralAvailability;


    public void saveTransaction(DiscountCode code, Double transactionAmount, LocalDateTime currentTime) {
        OfferTransaction offerTransactionToSave = OfferTransaction.offerTransactionDtoToEntity(code, currentTime);
        offerTransactionToSave.setAmount(BigDecimal.valueOf(transactionAmount));

        offerTransactionRepository.save(offerTransactionToSave);
    }

    public List<OfferTransaction> getTransactionByUserId(UUID userId) {
        return offerTransactionRepository.findAllByDiscountCode_UserId(userId);
    }

    public Optional<OfferTransaction> getLastOfferValidationForCitizen(UUID offerId, UUID citizenId) {
        return offerTransactionRepository.findFirstByDiscountCode_UserIdAndDiscountCode_OfferIdOrderByCreatedDateDesc(citizenId, offerId);
    }

    public List<TransactionDetailsDto> getAllValidTransactions() {

        return offerTransactionRepository.findAllByDiscountCode_Offer_SupplierIdOrderByCreatedDateDesc(getSupplierId())
                .stream()
                .map(this::convertToTransactionDetailsDto)
                .collect(Collectors.toList());
    }

    public List<Integer> getDistinctYearsForTransactionsBySupplierId() {
        return offerTransactionRepository.findDistinctYearByCreatedDateDesc(getSupplierId());
    }

    public Integer countIntervalTransactionsBySupplierId(LocalDate startDate, LocalDate endDate) {
        return offerTransactionRepository.countIntervalTransactionsBySupplierId(getSupplierId(), DateUtils.convertToLocalDateTime(startDate, false), DateUtils.convertToLocalDateTime(endDate, true));
    }

    public Integer countAllTransactionsBySupplierId() {
        return offerTransactionRepository.countByDiscountCodeOfferSupplierId(getSupplierId());
    }

    public List<OfferTransactionTableView> getTransactionsInterval(LocalDate startDate, LocalDate endDate, Integer page, Integer size) {
        Pageable pageable = PageRequest.of(page, size);

        return offerTransactionRepository.findTransactionsByInterval(
                getSupplierId(), DateUtils.convertToLocalDateTime(startDate, false), DateUtils.convertToLocalDateTime(endDate, true), pageable);
    }

    public List<Integer> getDistinctYearsForTransactionsByTenantId() {
        return offerTransactionRepository.findDistinctYearByTenantIdAndCreatedDateDesc(getTenantId());
    }

    public Integer countIntervalTransactions(LocalDate startDate, LocalDate endDate, String supplierId) {
        if (supplierId == null || supplierId.isEmpty()) {
            return countIntervalTransactionsByTenantId(startDate, endDate);
        }
        return countIntervalTransactionsByTenantIdAndSupplierId(startDate, endDate, supplierId);
    }

    public Integer countIntervalTransactionsByTenantId(LocalDate startDate, LocalDate endDate) {
        return offerTransactionRepository.countIntervalTransactionsByTenantId(getTenantId(), DateUtils.convertToLocalDateTime(startDate, false), DateUtils.convertToLocalDateTime(endDate, true));
    }

    public Integer countIntervalTransactionsByTenantIdAndSupplierId(LocalDate startDate, LocalDate endDate, String supplierId) {
        return offerTransactionRepository.countIntervalTransactionsByTenantIdAndSupplierId(getTenantId(), DateUtils.convertToLocalDateTime(startDate, false), DateUtils.convertToLocalDateTime(endDate, true), UUID.fromString(supplierId));
    }

    public List<OfferTransactionInvoiceTenantView> getTransactionsByIntervalAndTenantId(LocalDate startDate, LocalDate endDate) {
        return offerTransactionRepository.findTransactionsBetweenDatesByTenantId(
                getTenantId(), DateUtils.convertToLocalDateTime(startDate, false), DateUtils.convertToLocalDateTime(endDate, true));
    }

    public List<OfferTransactionInvoiceTenantView> getTransactionsByIntervalAndTenantIdAndSupplierId(LocalDate startDate, LocalDate endDate, String supplierId) {
        return offerTransactionRepository.findTransactionsBetweenDatesByTenantIdAndSupplierId(
                getTenantId(), DateUtils.convertToLocalDateTime(startDate, false), DateUtils.convertToLocalDateTime(endDate, true), UUID.fromString(supplierId));
    }


    public List<OfferTransactionTenantTableView> getTransactionsByIntervalAndTenantId(LocalDate startDate, LocalDate endDate, Integer page, Integer size, String supplierId) throws InvalidDateRangeException {
        Pageable pageable = PageRequest.of(page, size);
        if (startDate.isAfter(endDate)) {
            throw new InvalidDateRangeException(errorGeneralAvailability);
        }
        if (supplierId != null) {
            return offerTransactionRepository.findTransactionsByIntervalAndTenantIdAndSupplierId(
                    getTenantId(), UUID.fromString(supplierId), DateUtils.convertToLocalDateTime(startDate, false), DateUtils.convertToLocalDateTime(endDate, true), pageable);
        }

        return offerTransactionRepository.findTransactionsByIntervalAndTenantId(
                getTenantId(), DateUtils.convertToLocalDateTime(startDate, false), DateUtils.convertToLocalDateTime(endDate, true), pageable);

    }

    public List<OfferTransactionInvoiceDto> getTransactionsByMonthAndYear(LocalDate startDate, LocalDate endDate) {
        LocalDateTime endOfDay = endDate.atStartOfDay().plusDays(1).minusNanos(1);
        return offerTransactionRepository.findTransactionsByMonthAndYear(
                getSupplierId(), startDate.atStartOfDay(), endOfDay);
    }

    public Map<YearMonth, List<OfferTransactionsGroupedView>> getUserTransactionsGrouped(Integer pageIndex, Integer pageSize) {
        Pageable pageable = PageRequest.of(pageIndex, pageSize);

        List<OfferTransactionsGroupedView> transactions = getTransactions(pageable);
        Map<YearMonth, List<OfferTransactionsGroupedView>> grouped = groupTransactionsByMonth(transactions);

        List<YearMonth> monthsRange = determineMonthsRange(grouped, transactions.size(), pageSize);
        return fillMissingMonths(monthsRange, grouped);
    }

    public Integer countAllTransactionsByTenantId() {
        return offerTransactionRepository.countByDiscountCode_Offer_Supplier_Tenant_Id(getTenantId());
    }

    /**
     * Takes the selected period (month, quarter, year),
     * figures out which months to include,
     * fills them with 0 if there's no data,
     * and returns the total amount per month.
     */
    public List<MonthlyTransactionDto> getTransactionStatsForPeriod(TimeIntervalPeriod period) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime fromDate = DateUtils.calculateCreatedDate(period);

        List<MonthlyTransactionView> transactionStats = geTransactionsOnRole(fromDate);

        Set<Integer> expectedMonths = getExpectedMonthsForPeriod(now, period);
        Map<Integer, Double> statsMap = toMonthAmountMap(transactionStats);

        return expectedMonths.stream()
                .sorted()
                .map(month -> new MonthlyTransactionDto(month, statsMap.getOrDefault(month, 0.0)))
                .toList();
    }

    private List<YearMonth> determineMonthsRange(Map<YearMonth, List<OfferTransactionsGroupedView>> grouped, int transactionCount, int pageSize) {
        if (transactionCount < pageSize) {
            YearMonth startMonth = YearMonth.from(getUserCreatedTime());
            YearMonth endMonth = YearMonth.from(LocalDate.now());

            return getAllMonthsBetween(startMonth, endMonth);
        }

        YearMonth min = Collections.min(grouped.keySet());
        YearMonth max = Collections.max(grouped.keySet());
        return getAllMonthsBetween(min, max);
    }

    private List<MonthlyTransactionView> geTransactionsOnRole(LocalDateTime fromDate) {
        if (CommonUtils.isMunicipality(getUserRole())) {
            return offerTransactionRepository
                    .sumTransactionsByMonthAndTenantIdSince(getTenantId(), fromDate);
        }
        return offerTransactionRepository
                .sumTransactionsByMonthAndSupplierIdSince(getSupplierId(), fromDate);
    }

    private Set<Integer> getExpectedMonthsForPeriod(LocalDateTime now, TimeIntervalPeriod period) {
        return switch (period) {
            case MONTHLY -> Set.of(now.getMonthValue());
            case QUARTERLY -> calculateQuarterMonths(now);
            case YEARLY -> IntStream.rangeClosed(1, 12).boxed().collect(Collectors.toSet());
        };
    }

    private Set<Integer> calculateQuarterMonths(LocalDateTime now) {
        LocalDateTime startOfQuarter = DateUtils.calculateQuarterlyStartDate(now);
        return IntStream.rangeClosed(0, 3)
                .mapToObj(i -> startOfQuarter.plusMonths(i).getMonthValue())
                .collect(Collectors.toSet());
    }

    private Map<Integer, Double> toMonthAmountMap(List<MonthlyTransactionView> transactions) {
        return transactions.stream()
                .collect(Collectors.toMap(MonthlyTransactionView::getMonth, MonthlyTransactionView::getTotalAmount));
    }


    private List<OfferTransactionsGroupedView> getTransactions(Pageable pageable) {
        return offerTransactionRepository.findOfferTransactionsForCitizen(getUserId(), pageable);
    }

    private Map<YearMonth, List<OfferTransactionsGroupedView>> groupTransactionsByMonth(List<OfferTransactionsGroupedView> transactions) {
        return transactions.stream()
                .collect(Collectors.groupingBy(
                        transaction -> YearMonth.from(LocalDate.parse(transaction.getCreatedDate(), getDefaultDateTimeFormatter())),
                        LinkedHashMap::new,
                        Collectors.toList()
                ));
    }

    private LinkedHashMap<YearMonth, List<OfferTransactionsGroupedView>> fillMissingMonths(
            List<YearMonth> monthsRange,
            Map<YearMonth, List<OfferTransactionsGroupedView>> groupedTransactions
    ) {
        LinkedHashMap<YearMonth, List<OfferTransactionsGroupedView>> result = new LinkedHashMap<>();
        for (YearMonth month : monthsRange) {
            result.put(month, groupedTransactions.getOrDefault(month, new ArrayList<>()));
        }
        return result;
    }


    private List<YearMonth> getAllMonthsBetween(YearMonth start, YearMonth end) {

        return Stream.iterate(end, month -> month.minusMonths(1))
                .limit(ChronoUnit.MONTHS.between(start, end) + 1)
                .toList();
    }

    private TransactionDetailsDto convertToTransactionDetailsDto(OfferTransaction transaction) {
        return TransactionDetailsDto.of(
                transaction.getDiscountCode().getCode(),
                transaction.getCreatedDate()
        );
    }

    private UUID getSupplierId() {
        return principalService.getSupplierId();
    }

    private UUID getUserId() {
        return principalService.getUser().getId();
    }

    private LocalDateTime getUserCreatedTime() {
        return principalService.getUser().getCreatedDate();
    }

    private UUID getTenantId() {
        return principalService.getTenantId();
    }

    private String getUserRole() {
        return principalService.getUser().getRole().getName();
    }
}
