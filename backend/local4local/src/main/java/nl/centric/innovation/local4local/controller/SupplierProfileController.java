package nl.centric.innovation.local4local.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.ProfileDropdownsViewDto;
import nl.centric.innovation.local4local.dto.SupplierProfileDto;
import nl.centric.innovation.local4local.dto.SupplierProfilePatchDto;
import nl.centric.innovation.local4local.dto.SupplierProfileViewDto;
import nl.centric.innovation.local4local.dto.group.CreateValidationGroup;
import nl.centric.innovation.local4local.entity.Role;
import nl.centric.innovation.local4local.entity.Supplier;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.exceptions.NotFoundException;
import nl.centric.innovation.local4local.service.impl.ProfileDropdownsService;
import nl.centric.innovation.local4local.service.impl.SupplierProfileService;
import nl.centric.innovation.local4local.service.impl.SupplierService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import java.util.UUID;

@RestController
@Validated
@RequestMapping("/supplier-profiles")
@RequiredArgsConstructor
public class SupplierProfileController {

    private final SupplierProfileService supplierProfileService;

    private final SupplierService supplierService;

    private final ProfileDropdownsService profileDropdownsService;

    @GetMapping("/{supplierId}")
    @Secured({Role.ROLE_SUPPLIER, Role.ROLE_MUNICIPALITY_ADMIN})
    @Operation(
            summary = "Get Supplier Profile",
            description = "Retrieves the supplier profile and related information for the given supplier ID."
    )
    public ResponseEntity<SupplierProfileViewDto> getSupplierProfile(
            @Valid @PathVariable("supplierId")
            @Parameter(description = "UUID of the supplier", required = true) UUID supplierId)
            throws NotFoundException {

        Supplier result = supplierService.getSupplierWithProfile(supplierId);
        return ResponseEntity.ok(SupplierProfileViewDto.entityToSupplierProfileViewDto(result));
    }

    @GetMapping("/dropdown-data")
    @Secured({Role.ROLE_SUPPLIER, Role.ROLE_MUNICIPALITY_ADMIN})
    @Operation(
            summary = "Get Profile Dropdown Data",
            description = "Retrieves all necessary data for populating dropdowns in the supplier profile form."
    )
    public ProfileDropdownsViewDto getAllDataForDropdowns() {
        return profileDropdownsService.getAllProfileDropdownsData();
    }

    @PostMapping()
    @Secured({Role.ROLE_SUPPLIER})
    @Operation(
            summary = "Save Supplier Profile",
            description = "Creates a new supplier profile based on the provided data. " +
                    "Only users with the SUPPLIER role are allowed."
    )
    public ResponseEntity<SupplierProfileDto> saveSupplierProfile(
            @RequestBody @Validated(CreateValidationGroup.class)
            @Parameter(description = "Supplier profile data to be created", required = true)
            SupplierProfileDto supplierProfileDto,
            @CookieValue(value = "language_supplier", defaultValue = "nl-NL") String language)
            throws DtoValidateException {

        SupplierProfileDto result = supplierProfileService.save(supplierProfileDto, language);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @PatchMapping()
    @Secured({Role.ROLE_SUPPLIER})
    @Operation(
            summary = "Update Supplier Profile",
            description = "Updates an existing supplier profile. " +
                    "Only users with the SUPPLIER role are allowed."
    )
    public ResponseEntity<Void> updateSupplierProfile(
            @RequestBody @Valid SupplierProfilePatchDto supplierProfileDto)
            throws DtoValidateException {

        supplierProfileService.updateSupplierProfile(supplierProfileDto);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("reapplication")
    @Secured({Role.ROLE_SUPPLIER})
    @Operation(
            summary = "Reapply After Rejection",
            description = "Reapplies a supplier profile that was previously rejected. " +
                    "Only users with the SUPPLIER role are allowed."
    )
    public ResponseEntity<Void> reapplySupplierProfile(
            @RequestBody @Valid SupplierProfilePatchDto supplierProfileDto,
            @CookieValue(value = "language_supplier", defaultValue = "nl-NL") String language)
            throws DtoValidateException {

        supplierProfileService.reapplySupplierProfile(supplierProfileDto, language);
        return ResponseEntity.noContent().build();
    }
}
