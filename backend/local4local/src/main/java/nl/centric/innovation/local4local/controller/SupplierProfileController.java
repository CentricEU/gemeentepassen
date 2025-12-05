package nl.centric.innovation.local4local.controller;

import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.ProfileDropdownsViewDto;
import nl.centric.innovation.local4local.dto.SupplierProfileDto;
import nl.centric.innovation.local4local.dto.SupplierProfileViewDto;
import nl.centric.innovation.local4local.entity.Role;
import nl.centric.innovation.local4local.entity.Supplier;
import nl.centric.innovation.local4local.entity.User;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.exceptions.InvalidPrincipalException;
import nl.centric.innovation.local4local.exceptions.L4LException;
import nl.centric.innovation.local4local.exceptions.NotFoundException;
import nl.centric.innovation.local4local.service.impl.UserService;
import nl.centric.innovation.local4local.service.interfaces.ProfileDropdownsService;
import nl.centric.innovation.local4local.service.interfaces.SupplierProfileService;
import nl.centric.innovation.local4local.service.interfaces.SupplierService;
import nl.centric.innovation.local4local.util.ModelConverter;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import java.security.Principal;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/supplier-profiles")
@RequiredArgsConstructor
public class SupplierProfileController {

    private final SupplierProfileService supplierProfileService;

    private final SupplierService supplierService;

    private final UserService userService;

    private final ProfileDropdownsService profileDropdownsService;

    @GetMapping("/{supplierId}")
    public ResponseEntity<SupplierProfileViewDto> getSupplierProfile(
            @Valid @PathVariable("supplierId") UUID supplierId)
            throws NotFoundException, L4LException {

        Supplier result = supplierService.getSupplierWithProfile(supplierId);
        return ResponseEntity.ok(ModelConverter.entityToSupplierProfileViewDto(result));
    }

    @GetMapping("/dropdown-data")
    public ProfileDropdownsViewDto getAllDataForDropdowns() {
        return profileDropdownsService.getAllProfileDropdownsData();
    }

    @PostMapping
    @Secured({Role.ROLE_SUPPLIER})
    public ResponseEntity<SupplierProfileDto> saveSupplierProfile(
            @Valid @RequestBody SupplierProfileDto supplierProfileDto,
            Principal principal,
            @CookieValue(value = "language", defaultValue = "nl-NL") String language)
            throws DtoValidateException, InvalidPrincipalException {
        //Todo: move the logic to the service

        Optional<User> supplierUser = userService
                .findByUsername(principal.getName());
        if (supplierUser.isEmpty()) {
            throw new InvalidPrincipalException("INVALID_CREDENTIALS");
        }

        UUID tenantId = supplierUser.get().getTenantId();

        SupplierProfileDto result = supplierProfileService.save(supplierProfileDto);
        supplierProfileService.sendProfileSetupEmailToAllAdmins(tenantId, supplierProfileDto, language);

        return ResponseEntity.ok(result);
    }

    @PutMapping()
    @Secured({Role.ROLE_SUPPLIER})
    public ResponseEntity<Void> updateSupplierProfile(
            @Valid @RequestBody SupplierProfileDto supplierProfileDto)
            throws DtoValidateException {

        supplierProfileService.updateSupplierProfile(supplierProfileDto);

        return ResponseEntity.ok().build();
    }
}
