package nl.centric.innovation.local4local.controller;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.TenantBankInformationDto;
import nl.centric.innovation.local4local.dto.TenantDto;
import nl.centric.innovation.local4local.dto.TenantViewDto;
import nl.centric.innovation.local4local.entity.Role;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.service.impl.TenantService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/tenants")
public class TenantController {

    private final TenantService tenantService;

    @Operation(
            summary = "Get all tenants",
            description = """
                    Retrieves a list of all tenants.
                    This request is used on the registration page to show the available tenants."""
    )
    @GetMapping("/all")
    public ResponseEntity<List<TenantViewDto>> getAllTenants() {
        return ResponseEntity.ok(tenantService.getAllTenants());
    }

    @Operation(
            summary = "Get tenant by ID",
            description = "Retrieves the details of a specific tenant by its unique identifier."
    )
    @GetMapping("/{tenantId}")
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN, Role.ROLE_SUPPLIER, Role.ROLE_CITIZEN, Role.ROLE_CASHIER})
    public ResponseEntity<TenantViewDto> getTenantById(@PathVariable("tenantId") UUID tenantId) throws DtoValidateException {
        TenantViewDto tenant = tenantService.findByTenantId(tenantId);
        return ResponseEntity.ok(tenant);
    }

    @Operation(
            summary = "Create a new tenant",
            description = "Creates a new tenant with the provided details and returns the created tenant's information."
    )
    @PostMapping()
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN})
    public ResponseEntity<TenantViewDto> saveTenant(@Valid @RequestBody TenantDto tenant) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tenantService.save(tenant));
    }

    @Operation(
            summary = "Set up tenant bank information",
            description = "Sets up or updates the bank information for a tenant."
    )
    @PatchMapping("/bank-information")
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN})
    public ResponseEntity<Void> setupTenantBankInformation(@RequestBody @Valid TenantBankInformationDto tenantBankInformationDto)
            throws DtoValidateException {
        tenantService.saveTenantBankInformation(tenantBankInformationDto);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
