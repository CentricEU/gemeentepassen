package nl.centric.innovation.local4local.controller;

import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.OfferTransactionTableDto;
import nl.centric.innovation.local4local.dto.TransactionDetailsDto;
import nl.centric.innovation.local4local.entity.Role;
import nl.centric.innovation.local4local.service.impl.OfferTransactionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/transactions")
@RequiredArgsConstructor
public class OfferTransactionController {

    private final OfferTransactionService offerTransactionService;

    @GetMapping("/all")
    @Secured(Role.ROLE_SUPPLIER)
    public ResponseEntity<List<TransactionDetailsDto>> getAllValidTransactions() {
        List<TransactionDetailsDto> activeCodeDetails = offerTransactionService.getAllValidTransactions();
        return ResponseEntity.ok(activeCodeDetails);
    }

    @GetMapping("/years")
    @Secured(Role.ROLE_SUPPLIER)
    public ResponseEntity<List<Integer>> getDistinctYearsForTransactionsBySupplierId() {
        return ResponseEntity.ok(offerTransactionService.getDistinctYearsForTransactionsBySupplierId());
    }

    @GetMapping("/count-by-month-and-year")
    @Secured(Role.ROLE_SUPPLIER)
    public ResponseEntity<Integer> countMonthYearTransactionsBySupplierId(
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now().getMonthValue()}") Integer month,
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now().getYear()}") Integer year) {
        return ResponseEntity.ok(offerTransactionService.countMonthYearTransactionsBySupplierId(month, year));
    }

    @GetMapping("/count-all")
    @Secured(Role.ROLE_SUPPLIER)
    public ResponseEntity<Integer> countAllTransactionsBySupplierId() {
        return ResponseEntity.ok(offerTransactionService.countAllTransactionsBySupplierId());
    }

    @GetMapping("/filter-by-month-and-year")
    @Secured(Role.ROLE_SUPPLIER)
    public ResponseEntity<List<OfferTransactionTableDto>> getTransactionsByMonthAndYear(
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now().getMonthValue()}") Integer month,
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now().getYear()}") Integer year,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "25") Integer size
    ) {
        return ResponseEntity.ok(offerTransactionService.getTransactionsByMonthAndYear(month, year, page, size));
    }
}
