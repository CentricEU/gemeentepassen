package nl.centric.innovation.local4local.repository;

import nl.centric.innovation.local4local.dto.MonthlyTransactionDto;
import nl.centric.innovation.local4local.dto.OfferTransactionInvoiceDto;
import nl.centric.innovation.local4local.dto.OfferTransactionInvoiceTenantDto;
import nl.centric.innovation.local4local.dto.OfferTransactionTableDto;
import nl.centric.innovation.local4local.dto.OfferTransactionTenantTableDto;
import nl.centric.innovation.local4local.dto.OfferTransactionsGroupedDto;
import nl.centric.innovation.local4local.entity.OfferTransaction;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OfferTransactionRepository extends JpaRepository<OfferTransaction, UUID> {

    String FIND_DISTINCT_YEARS_QUERY = "SELECT DISTINCT YEAR(o.createdDate) FROM OfferTransaction o " +
            "WHERE o.discountCode.offer.supplier.id = :supplierId AND YEAR(o.createdDate) < YEAR(CURRENT_DATE) ORDER BY YEAR(o.createdDate) DESC";

    String COUNT_MONTH_YEAR_TRANSACTIONS_BY_SUPPLIER_ID = "SELECT COUNT(ot) FROM OfferTransaction ot WHERE " +
            "ot.discountCode.offer.supplier.id = :supplierId AND MONTH(ot.createdDate) = :month AND YEAR(ot.createdDate) = :year";

    String FIND_OFFER_TRANSACTIONS_BY_MONTH_AND_YEAR_ORDERED_DESC =
            "SELECT new nl.centric.innovation.local4local.dto.OfferTransactionTableDto( " +
                    "    ph.passNumber, " +
                    "    CONCAT(u.firstName, ' ', u.lastName), " +
                    "    ot.amount, " +
                    "    function('to_char', ot.createdDate, 'DD/MM/YYYY')," +
                    "    function('to_char', ot.createdDate, 'HH24:MI') " +
                    ") " +
                    "FROM OfferTransaction ot " +
                    "JOIN ot.discountCode dc " +
                    "JOIN User u ON u.id = dc.userId " +
                    "JOIN Passholder ph ON ph.user.id = u.id " +
                    "WHERE dc.offer.supplier.id = :supplierId " +
                    "  AND MONTH(ot.createdDate) = :month " +
                    "  AND YEAR(ot.createdDate) = :year " +
                    "ORDER BY ot.createdDate DESC";

    String FIND_OFFER_TRANSACTIONS_FOR_INVOICE_BY_MONTH_AND_YEAR_ORDERED_DESC =
            """
                        SELECT new nl.centric.innovation.local4local.dto.OfferTransactionInvoiceDto(
                            ph.passNumber,
                            ot)
                        FROM OfferTransaction ot
                        JOIN User u ON u.id = ot.discountCode.userId
                        JOIN Passholder ph ON ph.user.id = u.id
                        WHERE ot.discountCode.offer.supplier.id = :supplierId
                        AND ot.createdDate BETWEEN :startDate AND :endDate
                        ORDER BY ot.createdDate DESC
                    """;

    String FIND_OFFER_TRANSACTIONS_FOR_CITIZEN = """
                SELECT new nl.centric.innovation.local4local.dto.OfferTransactionsGroupedDto(
                    dc.offer.title,
                    dc.offer.supplier.companyName,
                    ot.amount,
                    dc.offer.offerType,
                    function('to_char', ot.createdDate, 'DD/MM/YYYY')
                )
                FROM OfferTransaction ot
                JOIN ot.discountCode dc
                WHERE dc.userId = :userId
                ORDER BY ot.createdDate DESC
            """;

    String SUM_TRANSACTIONS_BY_MONTH_AND_TENANT_ID = """
                SELECT new nl.centric.innovation.local4local.dto.MonthlyTransactionDto(
                    MONTH(ot.createdDate),
                    SUM(ot.amount)
                )
                FROM OfferTransaction ot
                WHERE ot.discountCode.offer.supplier.tenant.id = :tenantId
                AND ot.createdDate >= :fromDate
                GROUP BY MONTH(ot.createdDate)
                ORDER BY MONTH(ot.createdDate)
            """;

    String SUM_TRANSACTIONS_BY_MONTH_AND_SUPPLIER_ID = """
                SELECT new nl.centric.innovation.local4local.dto.MonthlyTransactionDto(
                    MONTH(ot.createdDate),
                    SUM(ot.amount)
                )
                FROM OfferTransaction ot
                WHERE ot.discountCode.offer.supplier.id = :supplierId
                AND ot.createdDate >= :fromDate
                GROUP BY MONTH(ot.createdDate)
                ORDER BY MONTH(ot.createdDate)
            """;

    String FIND_DISTINCT_YEARS_TENANT_QUERY = "SELECT DISTINCT YEAR(o.createdDate) FROM OfferTransaction o " +
            "WHERE o.discountCode.offer.supplier.tenant.id = :tenantId AND YEAR(o.createdDate) < YEAR(CURRENT_DATE) ORDER BY YEAR(o.createdDate) DESC";

    String FIND_OFFER_TRANSACTIONS_BY_MONTH_YEAR_AND_TENANT_ID_ORDERED_DESC =
            "SELECT new nl.centric.innovation.local4local.dto.OfferTransactionTenantTableDto( " +
                    "    ph.passNumber, " +
                    "    CONCAT(u.firstName, ' ', u.lastName), " +
                    "    ot.amount, " +
                    "    dc.offer.supplier.companyName, " +
                    "    dc.offer.benefit.name, " +
                    "    function('to_char', ot.createdDate, 'DD/MM/YYYY')," +
                    "    function('to_char', ot.createdDate, 'HH24:MI') " +
                    ") " +
                    "FROM OfferTransaction ot " +
                    "JOIN ot.discountCode dc " +
                    "JOIN User u ON u.id = dc.userId " +
                    "JOIN Passholder ph ON ph.user.id = u.id " +
                    "WHERE dc.offer.supplier.tenant.id = :tenantId " +
                    "  AND MONTH(ot.createdDate) = :month " +
                    "  AND YEAR(ot.createdDate) = :year " +
                    "ORDER BY ot.createdDate DESC";

    String FIND_OFFER_TRANSACTIONS_FOR_INVOICE_BY_TENANT_ID_AND_CREATED_DATE_BETWEEN_DATES_ORDERED_DESC =
            """
                        SELECT new nl.centric.innovation.local4local.dto.OfferTransactionInvoiceTenantDto(
                            ot.discountCode.offer.supplier.profile.iban,
                            ot.discountCode.offer.supplier.companyName,
                            ph.passNumber,
                            ot)
                        FROM OfferTransaction ot
                        JOIN User u ON u.id = ot.discountCode.userId
                        JOIN Passholder ph ON ph.user.id = u.id
                        WHERE ot.discountCode.offer.supplier.tenant.id = :tenantId
                        AND ot.createdDate BETWEEN :startDate AND :endDate
                        ORDER BY ot.createdDate DESC
                    """;

    String COUNT_MONTH_YEAR_TRANSACTIONS_BY_TENANT_ID = """
                SELECT COUNT(ot)
                FROM OfferTransaction ot
                WHERE ot.discountCode.offer.supplier.tenant.id = :tenantId AND MONTH(ot.createdDate) = :month AND YEAR(ot.createdDate) = :year
            """;

    Optional<OfferTransaction> findFirstByDiscountCode_UserIdAndDiscountCode_OfferIdOrderByCreatedDateDesc(UUID userId, UUID offerId);

    List<OfferTransaction> findAllByDiscountCode_Offer_SupplierIdOrderByCreatedDateDesc(UUID supplierId);

    @Query(FIND_DISTINCT_YEARS_QUERY)
    List<Integer> findDistinctYearByCreatedDateDesc(@Param("supplierId") UUID supplierId);

    @Query(COUNT_MONTH_YEAR_TRANSACTIONS_BY_SUPPLIER_ID)
    Integer countMonthYearTransactionsBySupplierId(@Param("supplierId") UUID supplierId, @Param("month") Integer month,
                                                   @Param("year") Integer year);

    Integer countByDiscountCodeOfferSupplierId(@Param("supplierId") UUID supplierId);

    @Query(FIND_OFFER_TRANSACTIONS_BY_MONTH_AND_YEAR_ORDERED_DESC)
    List<OfferTransactionTableDto> findTransactionsByMonthAndYear(@Param("supplierId") UUID supplierId,
                                                                  @Param("month") Integer month, @Param("year") Integer year, Pageable pageable);

    @Query(FIND_OFFER_TRANSACTIONS_FOR_INVOICE_BY_MONTH_AND_YEAR_ORDERED_DESC)
    List<OfferTransactionInvoiceDto> findTransactionsByMonthAndYear(
            @Param("supplierId") UUID supplierId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query(FIND_OFFER_TRANSACTIONS_FOR_CITIZEN)
    List<OfferTransactionsGroupedDto> findOfferTransactionsForCitizen(@Param("userId") UUID userId, Pageable pageable);

    Integer countByDiscountCode_Offer_Supplier_Tenant_Id(UUID tenantId);

    @Query(SUM_TRANSACTIONS_BY_MONTH_AND_TENANT_ID)
    List<MonthlyTransactionDto> sumTransactionsByMonthAndTenantIdSince(@Param("tenantId") UUID tenantId, @Param("fromDate") LocalDateTime fromDate);

    @Query(SUM_TRANSACTIONS_BY_MONTH_AND_SUPPLIER_ID)
    List<MonthlyTransactionDto> sumTransactionsByMonthAndSupplierIdSince(@Param("supplierId") UUID supplierId, @Param("fromDate") LocalDateTime fromDate);

    @Query(FIND_DISTINCT_YEARS_TENANT_QUERY)
    List<Integer> findDistinctYearByTenantIdAndCreatedDateDesc(@Param("tenantId") UUID tenantId);

    @Query(COUNT_MONTH_YEAR_TRANSACTIONS_BY_TENANT_ID)
    Integer countMonthYearTransactionsByTenantId(@Param("tenantId") UUID tenantId, @Param("month") Integer month,
                                                 @Param("year") Integer year);

    @Query(FIND_OFFER_TRANSACTIONS_BY_MONTH_YEAR_AND_TENANT_ID_ORDERED_DESC)
    List<OfferTransactionTenantTableDto> findTransactionsByMonthYearAndTenantId(@Param("tenantId") UUID supplierId,
                                                                                @Param("month") Integer month, @Param("year") Integer year, Pageable pageable);

    @Query(FIND_OFFER_TRANSACTIONS_FOR_INVOICE_BY_TENANT_ID_AND_CREATED_DATE_BETWEEN_DATES_ORDERED_DESC)
    List<OfferTransactionInvoiceTenantDto> findTransactionsBetweenDatesByTenantId(
            @Param("tenantId") UUID tenantId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}

