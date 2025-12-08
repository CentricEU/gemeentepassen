package nl.centric.innovation.local4local.controller;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.BenefitRequestDto;
import nl.centric.innovation.local4local.dto.BenefitResponseDto;
import nl.centric.innovation.local4local.dto.BenefitTableDto;
import nl.centric.innovation.local4local.dto.EligibleBenefitDto;
import nl.centric.innovation.local4local.entity.Role;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.service.impl.BenefitService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/benefits")
public class BenefitController {

    private final BenefitService benefitService;

    @PostMapping
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN})
    @Operation(
            summary = "Create a new benefit",
            description = "Create a new benefit for a citizen group"
    )
    public ResponseEntity<BenefitResponseDto> save(@RequestBody @Valid BenefitRequestDto benefitRequestDto) throws DtoValidateException {
        return ResponseEntity.status(HttpStatus.CREATED).body(benefitService.createBenefit(benefitRequestDto));
    }

    @GetMapping("/paginated")
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN})
    @Operation(
            summary = "Get a list of benefits paginated and sorted by creation date",
            description = "Get a list of benefits for the tenant, paginated and sorted by creation date. Defaults to page 0 and size 25."
    )
    public ResponseEntity<List<BenefitTableDto>> getAllBenefitsForTenant(
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "25") Integer size) {
        List<BenefitTableDto> response = benefitService.getAllBenefitsForTenant(page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/count")
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN})
    @Operation(
            summary = "Count benefits by tenant id",
            description = "Allows a Municipality Admin to count all benefits associated with their tenant"
    )
    public ResponseEntity<Long> countAllByTenantId() {
        return ResponseEntity.ok(benefitService.countAllByTenantId());
    }

    @GetMapping
    @Secured({Role.ROLE_CITIZEN})
    @Operation(
            summary = "Get a list of benefits for a citizen group",
            description = "Get a list of benefits available for a citizen group, grouped by free access/credit"
    )
    public ResponseEntity<List<EligibleBenefitDto>> getAllBenefitsForCitizenGroup() throws DtoValidateException {
        return ResponseEntity.ok(benefitService.getAllBenefitsDtoForCitizenGroup());
    }

    @GetMapping("/all")
    @Operation(
            summary = "Get all benefits for the current tenant (not expired)",
            description = "Returns a list of all benefits associated with the current tenant, accessible by Municipality Admin and Supplier roles and not expired."
    )
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN, Role.ROLE_SUPPLIER})
    public ResponseEntity<List<BenefitTableDto>> getAllByTenantId() {
        return ResponseEntity.ok(benefitService.getAllBenefitsForTenant());
    }

    @GetMapping("all-for-citizen")
    @Operation(
            summary = "Get all benefits for a citizen",
            description = "Returns a list of all benefits available to a citizen."
    )
    @Secured({Role.ROLE_CITIZEN})
    public ResponseEntity<Map<String, List<BenefitResponseDto>>> getAllBenefitsForCitizen() throws DtoValidateNotFoundException {
        return ResponseEntity.ok(benefitService.getAllBenefitsForCitizen());
    }

}
