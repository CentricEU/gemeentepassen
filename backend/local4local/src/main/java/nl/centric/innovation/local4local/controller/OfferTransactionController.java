package nl.centric.innovation.local4local.controller;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.OfferTransactionTableDto;
import nl.centric.innovation.local4local.dto.OfferTransactionTenantTableDto;
import nl.centric.innovation.local4local.dto.OfferTransactionsGroupedDto;
import nl.centric.innovation.local4local.dto.TransactionDetailsDto;
import nl.centric.innovation.local4local.entity.Role;
import nl.centric.innovation.local4local.service.impl.OfferTransactionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.YearMonth;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/transactions")
@RequiredArgsConstructor
public class OfferTransactionController {

    private final OfferTransactionService offerTransactionService;

    @GetMapping("/supplier/all")
    @Secured({Role.ROLE_SUPPLIER, Role.ROLE_CASHIER})
    @Operation(
            summary = "Retrieve all valid supplier transactions",
            description = "Returns a list of all active and valid offer transactions available for the supplier or cashier."
    )
    public ResponseEntity<List<TransactionDetailsDto>> getAllValidTransactions() {
        List<TransactionDetailsDto> activeCodeDetails = offerTransactionService.getAllValidTransactions();
        return ResponseEntity.ok(activeCodeDetails);
    }

    @GetMapping("/supplier/years")
    @Secured(Role.ROLE_SUPPLIER)
    @Operation(
            summary = "Get all distinct transaction years for supplier",
            description = "Retrieves a list of distinct years during which transactions have occurred for the authenticated supplier."
    )
    public ResponseEntity<List<Integer>> getDistinctYearsForTransactionsBySupplierId() {
        return ResponseEntity.ok(offerTransactionService.getDistinctYearsForTransactionsBySupplierId());
    }

    @GetMapping("/supplier/count-by-month-and-year")
    @Secured(Role.ROLE_SUPPLIER)
    @Operation(
            summary = "Count supplier transactions by month and year",
            description = "Returns the total number of transactions performed by the supplier for a given month and year. Defaults to the current month and year if not specified."
    )
    public ResponseEntity<Integer> countMonthYearTransactionsBySupplierId(
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now().getMonthValue()}") Integer month,
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now().getYear()}") Integer year) {
        return ResponseEntity.ok(offerTransactionService.countMonthYearTransactionsBySupplierId(month, year));
    }

    @GetMapping("/supplier/count-all")
    @Secured(Role.ROLE_SUPPLIER)
    @Operation(
            summary = "Count all transactions by supplier",
            description = "Retrieves the total number of transactions associated with the authenticated supplier."
    )
    public ResponseEntity<Integer> countAllTransactionsBySupplierId() {
        return ResponseEntity.ok(offerTransactionService.countAllTransactionsBySupplierId());
    }

    @GetMapping("/supplier/filter-by-month-and-year")
    @Secured(Role.ROLE_SUPPLIER)
    @Operation(
            summary = "Filter supplier transactions by month and year",
            description = "Returns a paginated list of transactions for a given month and year associated with the authenticated supplier."
    )
    public ResponseEntity<List<OfferTransactionTableDto>> getTransactionsByMonthAndYear(
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now().getMonthValue()}") Integer month,
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now().getYear()}") Integer year,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "25") Integer size
    ) {
        return ResponseEntity.ok(offerTransactionService.getTransactionsByMonthAndYear(month, year, page, size));
    }

    @GetMapping("/group-by-months")
    @Secured(Role.ROLE_CITIZEN)
    @Operation(
            summary = "Group citizen transactions by month",
            description = "Retrieves a paginated list of transactions grouped by month for the authenticated citizen."
    )
    public ResponseEntity<Map<YearMonth, List<OfferTransactionsGroupedDto>>> getTransactionsGroupedByMonths(@RequestParam(defaultValue = "0") Integer page,
                                                                                                            @RequestParam(defaultValue = "25") Integer size) {
        return ResponseEntity.ok(offerTransactionService.getUserTransactionsGrouped(page, size));
    }

    @GetMapping("/admin/count-all")
    @Secured(Role.ROLE_MUNICIPALITY_ADMIN)
    @Operation(
            summary = "Count all transactions by tenant",
            description = "Retrieves the total count of all offer transactions associated with the tenant of the authenticated admin."
    )
    public ResponseEntity<Integer> countAllTransactionsByTenantId() {
        return ResponseEntity.ok(offerTransactionService.countAllTransactionsByTenantId());
    }

    @GetMapping("/admin/count-by-month-and-year")
    @Secured(Role.ROLE_MUNICIPALITY_ADMIN)
    @Operation(
            summary = "Count all transactions by tenant for given month and year",
            description = "Retrieves the total count of offer transactions associated with the tenant of the authenticated admin for given month and year."
    )
    public ResponseEntity<Integer> countMonthYearTransactionsByTenantId(
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now().getMonthValue()}") Integer month,
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now().getYear()}") Integer year) {
        return ResponseEntity.ok(offerTransactionService.countMonthYearTransactionsByTenantId(month, year));
    }

    @GetMapping("/admin/years")
    @Secured(Role.ROLE_MUNICIPALITY_ADMIN)
    @Operation(
            summary = "Get all distinct years for transactions by tenant ID",
            description = """
                    Retrieves a list of distinct years (as integers) in which offer transactions were created, associated with the tenant of the authenticated admin.
                    It only includes years before the current year and orders them in descending order."""
    )
    public ResponseEntity<List<Integer>> getDistinctYearsForTransactionsByTenantId() {
        return ResponseEntity.ok(offerTransactionService.getDistinctYearsForTransactionsByTenantId());
    }

    @GetMapping("/admin/filter-by-month-and-year")
    @Secured(Role.ROLE_MUNICIPALITY_ADMIN)
    @Operation(
            summary = "Retrieve paginated transaction list by tenant for given month and year",
            description = "Allows a Municipality Admin to retrieve a paginated list of transactions for given month and year associated with the tenant of the logged in admin."
    )
    public ResponseEntity<List<OfferTransactionTenantTableDto>> getTransactionsByMonthYearAndTenant(
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now().getMonthValue()}") Integer month,
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now().getYear()}") Integer year,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "25") Integer size
    ) {
        return ResponseEntity.ok(offerTransactionService.getTransactionsByMonthYearAndTenantId(month, year, page, size));
    }
}
