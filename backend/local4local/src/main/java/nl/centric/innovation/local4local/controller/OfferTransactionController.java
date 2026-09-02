package nl.centric.innovation.local4local.controller;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.OfferTransactionTableDto;
import nl.centric.innovation.local4local.dto.OfferTransactionTableView;
import nl.centric.innovation.local4local.dto.OfferTransactionTenantTableDto;
import nl.centric.innovation.local4local.dto.OfferTransactionTenantTableView;
import nl.centric.innovation.local4local.dto.OfferTransactionsGroupedDto;
import nl.centric.innovation.local4local.dto.OfferTransactionsGroupedView;
import nl.centric.innovation.local4local.dto.TransactionDetailsDto;
import nl.centric.innovation.local4local.entity.Role;
import nl.centric.innovation.local4local.exceptions.InvalidDateRangeException;
import nl.centric.innovation.local4local.service.impl.OfferTransactionService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
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

    @GetMapping("/supplier/count")
    @Secured(Role.ROLE_SUPPLIER)
    @Operation(
            summary = "Count supplier transactions by intnerval",
            description = "Returns the total number of transactions performed by the supplier for a given interval. Defaults to the current interval if not specified."
    )
    public ResponseEntity<Integer> countMonthYearTransactionsBySupplierId(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(offerTransactionService.countIntervalTransactionsBySupplierId(startDate, endDate));
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

    @GetMapping("/supplier/filter")
    @Secured(Role.ROLE_SUPPLIER)
    @Operation(
            summary = "Filter supplier transactions by interval",
            description = "Returns a paginated list of transactions for a given interval associated with the authenticated supplier."
    )
    public ResponseEntity<List<OfferTransactionTableView>> getTransactionsByInterval(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "25") Integer size
    ) {
        return ResponseEntity.ok(offerTransactionService.getTransactionsInterval(startDate, endDate, page, size));
    }

    @GetMapping("/group-by-months")
    @Secured(Role.ROLE_CITIZEN)
    @Operation(
            summary = "Group citizen transactions by month",
            description = "Retrieves a paginated list of transactions grouped by month for the authenticated citizen."
    )
    public ResponseEntity<Map<YearMonth, List<OfferTransactionsGroupedView>>> getTransactionsGroupedByMonths(@RequestParam(defaultValue = "0") Integer page,
                                                                                                             @RequestParam(defaultValue = "25") Integer size) {
        return ResponseEntity.ok(offerTransactionService.getUserTransactionsGrouped(page, size));
    }

    @GetMapping("/admin/count-all")
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN, Role.ROLE_SUPER_ADMIN})
    @Operation(
            summary = "Count all transactions by tenant",
            description = "Retrieves the total count of all offer transactions associated with the tenant of the authenticated admin."
    )
    public ResponseEntity<Integer> countAllTransactionsByTenantId() {
        return ResponseEntity.ok(offerTransactionService.countAllTransactionsByTenantId());
    }

    @GetMapping("/admin/count")
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN, Role.ROLE_SUPER_ADMIN})
    @Operation(
            summary = "Count all transactions by tenant for given interval",
            description = "Retrieves the total count of offer transactions associated with the tenant of the authenticated admin for given interval."
    )
    public ResponseEntity<Integer> countIntervalTransactionsByTenantId(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String supplierId) {
        return ResponseEntity.ok(offerTransactionService.countIntervalTransactions(startDate, endDate, supplierId));
    }

    @GetMapping("/admin/years")
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN, Role.ROLE_SUPER_ADMIN})
    @Operation(
            summary = "Get all distinct years for transactions by tenant ID",
            description = """
                    Retrieves a list of distinct years (as integers) in which offer transactions were created, associated with the tenant of the authenticated admin.
                    It only includes years before the current year and orders them in descending order."""
    )
    public ResponseEntity<List<Integer>> getDistinctYearsForTransactionsByTenantId() {
        return ResponseEntity.ok(offerTransactionService.getDistinctYearsForTransactionsByTenantId());
    }

    @GetMapping("/admin/filter")
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN, Role.ROLE_SUPER_ADMIN})
    @Operation(
            summary = "Retrieve paginated transaction list by tenant for given interval",
            description = "Allows a Municipality Admin to retrieve a paginated list of transactions for given interval associated with the tenant of the logged in admin."
    )
    public ResponseEntity<List<OfferTransactionTenantTableView>> getTransactionsByMonthYearAndTenant(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "25") Integer size,
            @RequestParam(required = false) String supplierId
    ) throws InvalidDateRangeException {
        return ResponseEntity.ok(offerTransactionService.getTransactionsByIntervalAndTenantId(startDate, endDate, page, size, supplierId));
    }
}
