package nl.centric.innovation.local4local.controller;


import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.DashboardCountDto;
import nl.centric.innovation.local4local.dto.MonthlyTransactionDto;
import nl.centric.innovation.local4local.entity.Role;
import io.swagger.v3.oas.annotations.Operation;
import nl.centric.innovation.local4local.dto.OfferStatisticsDto;
import nl.centric.innovation.local4local.enums.SupplierStatusEnum;
import nl.centric.innovation.local4local.enums.TimeIntervalPeriod;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.service.impl.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/statistics")
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN})
    @Operation(
            summary = "Get dashboard counts",
            description = "Returns the counts of passholders, suppliers, and transactions for the given supplier statuses."
    )
    public ResponseEntity<DashboardCountDto> getMunicipalityStatistics(
            @RequestParam Set<SupplierStatusEnum> statuses) throws DtoValidateNotFoundException {
        return ResponseEntity.ok(dashboardService.getDashboardCounts(statuses));
    }

    @GetMapping("/used-offer/statistics")
    @Secured({"ROLE_SUPPLIER"})
    @Operation(
            summary = "Get statistics of used offers",
            description = "Returns a map containing statistics of used offers.")
    public ResponseEntity<List<OfferStatisticsDto>> getUsedOfferStatistics(
            @Parameter(description = "Time interval period, possible values: MONTHLY, QUARTERLY, YEARLY")
            @RequestParam TimeIntervalPeriod intervalPeriod) {
        return ResponseEntity.ok(dashboardService.getUsedOfferStatistics(intervalPeriod));
    }

    @GetMapping("/transaction/statistics")
    @Operation(
            summary = "Get statistics of transactions",
            description = "Returns a list containing statistics of transactions.")
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN, Role.ROLE_SUPPLIER})
    public ResponseEntity<List<MonthlyTransactionDto>> getTransactionStatistics(
            @Parameter(description = "Time interval period, possible values: MONTHLY, QUARTERLY, YEARLY")
            @RequestParam TimeIntervalPeriod intervalPeriod) {

        return ResponseEntity.ok(dashboardService.getMonthlyTransactionStats(intervalPeriod));

    }
}
