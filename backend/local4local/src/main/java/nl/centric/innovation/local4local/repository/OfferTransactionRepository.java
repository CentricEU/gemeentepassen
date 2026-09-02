package nl.centric.innovation.local4local.repository;

import nl.centric.innovation.local4local.dto.MonthlyTransactionView;
import nl.centric.innovation.local4local.dto.OfferTransactionInvoiceDto;
import nl.centric.innovation.local4local.dto.OfferTransactionInvoiceTenantView;
import nl.centric.innovation.local4local.dto.OfferTransactionTableView;
import nl.centric.innovation.local4local.dto.OfferTransactionTenantTableView;
import nl.centric.innovation.local4local.dto.OfferTransactionsGroupedView;
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

    String COUNT_STARTDATE_AND_ENDDATE_TRANSACTIONS_BY_SUPPLIER_ID = "SELECT COUNT(ot) FROM OfferTransaction ot WHERE " +
            "ot.discountCode.offer.supplier.id = :supplierId AND ot.createdDate BETWEEN :startDate AND :endDate";

    String FIND_OFFER_TRANSACTIONS_BY_STARTDATE_AND_ENDDATE_ORDERED_DESC =
            "SELECT " +
                    "ph.passNumber AS passNumber, " +
                    "CONCAT(u.firstName, ' ', u.lastName) AS citizenName, " +
                    "ot.amount AS amount, " +
                    "function('to_char', ot.createdDate, 'DD/MM/YYYY') AS createdDate, " +
                    "function('to_char', ot.createdDate, 'HH24:MI') AS createdTime " +
                    "FROM OfferTransaction ot " +
                    "JOIN ot.discountCode dc " +
                    "JOIN User u ON u.id = dc.userId " +
                    "LEFT JOIN Passholder ph ON ph.user.id = u.id " +
                    "WHERE dc.offer.supplier.id = :supplierId " +
                    "AND ot.createdDate BETWEEN :startDate AND :endDate " +
                    "ORDER BY ot.createdDate DESC";

    String FIND_OFFER_TRANSACTIONS_FOR_INVOICE_BY_INTERVAL_ORDERED_DESC =
            """
                        SELECT new nl.centric.innovation.local4local.dto.OfferTransactionInvoiceDto(
                            ph.passNumber,
                            ot)
                        FROM OfferTransaction ot
                        JOIN User u ON u.id = ot.discountCode.userId
                        LEFT JOIN Passholder ph ON ph.user.id = u.id
                        WHERE ot.discountCode.offer.supplier.id = :supplierId
                        AND ot.createdDate BETWEEN :startDate AND :endDate
                        ORDER BY ot.createdDate DESC
                    """;

    String FIND_OFFER_TRANSACTIONS_FOR_CITIZEN = """
                SELECT
                dc.offer.title AS offerTitle,
                dc.offer.supplier.companyName AS supplierName,
                ot.amount AS amount,
                dc.offer.offerType AS offerType,
                function('to_char', ot.createdDate, 'DD/MM/YYYY') AS createdDate\s
                FROM OfferTransaction ot
                JOIN ot.discountCode dc
                WHERE dc.userId = :userId
                ORDER BY ot.createdDate DESC
            """;

    String SUM_TRANSACTIONS_BY_MONTH_AND_TENANT_ID = """
                SELECT
                    MONTH(ot.createdDate) as month,
                    SUM(ot.amount) as totalAmount
                FROM OfferTransaction ot
                WHERE ot.discountCode.offer.supplier.tenant.id = :tenantId
                AND ot.createdDate >= :fromDate
                GROUP BY MONTH(ot.createdDate)
                ORDER BY MONTH(ot.createdDate)
            """;

    String SUM_TRANSACTIONS_BY_MONTH_AND_SUPPLIER_ID = """
                SELECT
                    MONTH(ot.createdDate) as month,
                    SUM(ot.amount) as totalAmount
                FROM OfferTransaction ot
                WHERE ot.discountCode.offer.supplier.id = :supplierId
                AND ot.createdDate >= :fromDate
                GROUP BY MONTH(ot.createdDate)
                ORDER BY MONTH(ot.createdDate)
            """;

    String FIND_DISTINCT_YEARS_TENANT_QUERY = "SELECT DISTINCT YEAR(o.createdDate) FROM OfferTransaction o " +
            "WHERE o.discountCode.offer.supplier.tenant.id = :tenantId AND YEAR(o.createdDate) < YEAR(CURRENT_DATE) ORDER BY YEAR(o.createdDate) DESC";


    String FIND_OFFER_TRANSACTIONS_INTERVAL_AND_TENANT_ID_ORDERED_DESC =
            "SELECT " +
                    "ph.passNumber AS passNumber, " +
                    "CONCAT(u.firstName, ' ', u.lastName) AS citizenName, " +
                    "ot.amount AS amount, " +
                    "dc.offer.supplier.companyName AS supplierName, " +
                    "dc.offer.benefit.name AS benefit, " +
                    "function('to_char', ot.createdDate, 'DD/MM/YYYY') AS createdDate, " +
                    "function('to_char', ot.createdDate, 'HH24:MI') AS createdTime " +
                    "FROM OfferTransaction ot " +
                    "JOIN ot.discountCode dc " +
                    "JOIN User u ON u.id = dc.userId " +
                    "LEFT JOIN Passholder ph ON ph.user.id = u.id " +
                    "WHERE dc.offer.supplier.tenant.id = :tenantId " +
                    "AND ot.createdDate BETWEEN :startDate AND :endDate " +
                    "ORDER BY ot.createdDate DESC";

    String FIND_OFFER_TRANSACTIONS_INTERVAL_AND_TENANT_ID_AND_SUPPLIER_ID_ORDERED_DESC =
            "SELECT " +
                    "ph.passNumber AS passNumber, " +
                    "CONCAT(u.firstName, ' ', u.lastName) AS citizenName, " +
                    "ot.amount AS amount, " +
                    "dc.offer.supplier.companyName AS supplierName, " +
                    "dc.offer.benefit.name AS benefit, " +
                    "function('to_char', ot.createdDate, 'DD/MM/YYYY') AS createdDate, " +
                    "function('to_char', ot.createdDate, 'HH24:MI') AS createdTime " +
                    "FROM OfferTransaction ot " +
                    "JOIN ot.discountCode dc " +
                    "JOIN User u ON u.id = dc.userId " +
                    "LEFT JOIN Passholder ph ON ph.user.id = u.id " +
                    "WHERE dc.offer.supplier.tenant.id = :tenantId " +
                    "AND dc.offer.supplier.id = :supplierId " +
                    "AND ot.createdDate BETWEEN :startDate AND :endDate " +
                    "ORDER BY ot.createdDate DESC";

    String FIND_OFFER_TRANSACTIONS_FOR_INVOICE_BY_TENANT_ID_AND_CREATED_DATE_BETWEEN_DATES_ORDERED_DESC =
            """
                    SELECT
                        ot.discountCode.offer.supplier.profile.iban AS supplierIban,
                        ot.discountCode.offer.supplier.companyName AS supplierName,
                        ph.passNumber AS passNumber,
                        ot AS offerTransaction
                    FROM OfferTransaction ot
                    JOIN User u ON u.id = ot.discountCode.userId
                    LEFT JOIN Passholder ph ON ph.user.id = u.id
                    WHERE ot.discountCode.offer.supplier.tenant.id = :tenantId
                      AND ot.createdDate BETWEEN :startDate AND :endDate
                    ORDER BY ot.createdDate DESC
                    """;

    String FIND_OFFER_TRANSACTIONS_FOR_INVOICE_BY_TENANT_ID_AND_SUPPLIER_ID_AND_CREATED_DATE_BETWEEN_DATES_ORDERED_DESC =
            """
                    SELECT
                        ot.discountCode.offer.supplier.profile.iban AS supplierIban,
                        ot.discountCode.offer.supplier.companyName AS supplierName,
                        ph.passNumber AS passNumber,
                        ot AS offerTransaction
                    FROM OfferTransaction ot
                    JOIN User u ON u.id = ot.discountCode.userId
                    LEFT JOIN Passholder ph ON ph.user.id = u.id
                    WHERE ot.discountCode.offer.supplier.tenant.id = :tenantId
                      AND ot.discountCode.offer.supplier.id = :supplierId
                      AND ot.createdDate BETWEEN :startDate AND :endDate
                    ORDER BY ot.createdDate DESC
                    """;

    String COUNT_INTERVAL_TRANSACTIONS_BY_TENANT_ID = """
                SELECT COUNT(ot)
                FROM OfferTransaction ot
                WHERE ot.discountCode.offer.supplier.tenant.id = :tenantId AND ot.createdDate BETWEEN :startDate AND :endDate
            """;

    String COUNT_INTERVAL_TRANSACTIONS_BY_TENANT_ID_AND_SUPPLIER_ID = """
                SELECT COUNT(ot)
                FROM OfferTransaction ot
                WHERE ot.discountCode.offer.supplier.tenant.id = :tenantId 
                AND ot.discountCode.offer.supplier.id = :supplierId
                AND ot.createdDate BETWEEN :startDate AND :endDate
            """;


    Optional<OfferTransaction> findFirstByDiscountCode_UserIdAndDiscountCode_OfferIdOrderByCreatedDateDesc(UUID userId, UUID offerId);

    List<OfferTransaction> findAllByDiscountCode_Offer_SupplierIdOrderByCreatedDateDesc(UUID supplierId);

    @Query(FIND_DISTINCT_YEARS_QUERY)
    List<Integer> findDistinctYearByCreatedDateDesc(@Param("supplierId") UUID supplierId);

    @Query(COUNT_STARTDATE_AND_ENDDATE_TRANSACTIONS_BY_SUPPLIER_ID)
    Integer countIntervalTransactionsBySupplierId(@Param("supplierId") UUID supplierId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    Integer countByDiscountCodeOfferSupplierId(@Param("supplierId") UUID supplierId);

    @Query(FIND_OFFER_TRANSACTIONS_BY_STARTDATE_AND_ENDDATE_ORDERED_DESC)
    List<OfferTransactionTableView> findTransactionsByInterval(@Param("supplierId") UUID supplierId,
                                                               @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);

    @Query(FIND_OFFER_TRANSACTIONS_FOR_INVOICE_BY_INTERVAL_ORDERED_DESC)
    List<OfferTransactionInvoiceDto> findTransactionsByMonthAndYear(
            @Param("supplierId") UUID supplierId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query(FIND_OFFER_TRANSACTIONS_FOR_CITIZEN)
    List<OfferTransactionsGroupedView> findOfferTransactionsForCitizen(@Param("userId") UUID userId, Pageable pageable);

    Integer countByDiscountCode_Offer_Supplier_Tenant_Id(UUID tenantId);

    @Query(SUM_TRANSACTIONS_BY_MONTH_AND_TENANT_ID)
    List<MonthlyTransactionView> sumTransactionsByMonthAndTenantIdSince(@Param("tenantId") UUID tenantId, @Param("fromDate") LocalDateTime fromDate);

    @Query(SUM_TRANSACTIONS_BY_MONTH_AND_SUPPLIER_ID)
    List<MonthlyTransactionView> sumTransactionsByMonthAndSupplierIdSince(@Param("supplierId") UUID supplierId, @Param("fromDate") LocalDateTime fromDate);

    @Query(FIND_DISTINCT_YEARS_TENANT_QUERY)
    List<Integer> findDistinctYearByTenantIdAndCreatedDateDesc(@Param("tenantId") UUID tenantId);

    @Query(COUNT_INTERVAL_TRANSACTIONS_BY_TENANT_ID)
    Integer countIntervalTransactionsByTenantId(@Param("tenantId") UUID tenantId, @Param("startDate") LocalDateTime startDate,
                                                @Param("endDate") LocalDateTime endDate);

    @Query(COUNT_INTERVAL_TRANSACTIONS_BY_TENANT_ID_AND_SUPPLIER_ID)
    Integer countIntervalTransactionsByTenantIdAndSupplierId(@Param("tenantId") UUID tenantId, @Param("startDate") LocalDateTime startDate,
                                                             @Param("endDate") LocalDateTime endDate,
                                                             @Param("supplierId") UUID supplierId);


    @Query(FIND_OFFER_TRANSACTIONS_INTERVAL_AND_TENANT_ID_ORDERED_DESC)
    List<OfferTransactionTenantTableView> findTransactionsByIntervalAndTenantId(@Param("tenantId") UUID tenantId,
                                                                                @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);

    @Query(FIND_OFFER_TRANSACTIONS_INTERVAL_AND_TENANT_ID_AND_SUPPLIER_ID_ORDERED_DESC)
    List<OfferTransactionTenantTableView> findTransactionsByIntervalAndTenantIdAndSupplierId(@Param("tenantId") UUID tenantId,
                                                                                             @Param("supplierId") UUID supplierId,
                                                                                             @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);

    @Query(FIND_OFFER_TRANSACTIONS_FOR_INVOICE_BY_TENANT_ID_AND_CREATED_DATE_BETWEEN_DATES_ORDERED_DESC)
    List<OfferTransactionInvoiceTenantView> findTransactionsBetweenDatesByTenantId(
            @Param("tenantId") UUID tenantId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);


    @Query(FIND_OFFER_TRANSACTIONS_FOR_INVOICE_BY_TENANT_ID_AND_SUPPLIER_ID_AND_CREATED_DATE_BETWEEN_DATES_ORDERED_DESC)
    List<OfferTransactionInvoiceTenantView> findTransactionsBetweenDatesByTenantIdAndSupplierId(
            @Param("tenantId") UUID tenantId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, @Param("supplierId") UUID supplierId);

    List<OfferTransaction> findAllByDiscountCode_UserId(@Param("userId") UUID userId);
}

