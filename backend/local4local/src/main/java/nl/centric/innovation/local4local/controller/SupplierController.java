package nl.centric.innovation.local4local.controller;

import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.RegisterSupplierDto;
import nl.centric.innovation.local4local.dto.RejectSupplierDto;
import nl.centric.innovation.local4local.dto.SupplierForMapViewDto;
import nl.centric.innovation.local4local.dto.SupplierViewDto;
import nl.centric.innovation.local4local.entity.Role;
import nl.centric.innovation.local4local.entity.Supplier;
import nl.centric.innovation.local4local.entity.Tenant;
import nl.centric.innovation.local4local.enums.SupplierStatusEnum;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.service.impl.PrincipalService;
import nl.centric.innovation.local4local.service.interfaces.SupplierService;
import nl.centric.innovation.local4local.service.interfaces.TenantService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/suppliers")
public class SupplierController {

    private final SupplierService supplierService;

    private final TenantService tenantService;

    private final PrincipalService principalService;

    @Value("${error.entity.notfound}")
    private String errorEntityNotFound;

    @PutMapping(path = "/approve/{supplierId}")
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN})
    public ResponseEntity<Void> approveSupplier(@PathVariable("supplierId") UUID supplierId,
                                                @CookieValue(value = "language", defaultValue = "nl-NL") String language) throws DtoValidateException {
        supplierService.approveSupplier(supplierId, language);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PutMapping(path = "/change-has-status-update/{supplierId}")
    @Secured({Role.ROLE_SUPPLIER})
    public ResponseEntity<Void> changeHasStatusUpdate(@RequestParam(defaultValue = "false") boolean hasStatusUpdate,
                                                      @Valid @PathVariable("supplierId") UUID supplierId) throws DtoValidateNotFoundException {
        // Todo: move the logic to the service
        Optional<Supplier> supplier = supplierService.findBySupplierId(supplierId);
        if (supplier.isEmpty()) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }

        supplierService.updateSupplierHasStatusUpdate(supplierId, hasStatusUpdate);

        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @GetMapping("/{supplierId}")
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN, Role.ROLE_SUPPLIER})
    public ResponseEntity<SupplierViewDto> getSupplier(@PathVariable("supplierId") UUID supplierId)
            throws DtoValidateException {
        // Todo: move the logic to the service
        Optional<Supplier> result = supplierService.findBySupplierId(supplierId);
        if (result.isEmpty()) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }

        return ResponseEntity.ok(SupplierViewDto.entityToSupplierViewDto(result.get()));
    }

    @PostMapping("/register")
    public ResponseEntity<Void> saveSupplier(@RequestBody RegisterSupplierDto registerSupplierDto,
                                             @CookieValue(value = "language", defaultValue = "nl-NL") String language) throws DtoValidateException {
        // Todo: move the logic to the service
        Optional<Tenant> tenant = tenantService.findByTenantId(registerSupplierDto.tenantId());

        supplierService.save(registerSupplierDto, tenant, language);
        return ResponseEntity.ok().build();
    }

    @Secured({Role.ROLE_MUNICIPALITY_ADMIN})
    @PostMapping(path = "/reject")
    public ResponseEntity<Void> rejectSupplier(@RequestBody RejectSupplierDto rejectSupplierDto,
                                               @CookieValue(value = "language", defaultValue = "nl-NL") String language) throws DtoValidateException {

        supplierService.rejectSupplier(rejectSupplierDto, language, rejectSupplierDto.reason().getReason());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/rejection/{supplierId}")
    @Secured({Role.ROLE_SUPPLIER})
    public ResponseEntity<RejectSupplierDto> getRejectedSupplier(@Valid @PathVariable("supplierId") UUID supplierId) throws DtoValidateException {
        return ResponseEntity.ok(supplierService.getRejectedSupplier(supplierId));
    }

    @GetMapping("/all")
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN})
    public ResponseEntity<List<SupplierViewDto>> getAllByTenantId(@RequestParam UUID tenantId,
                                                                  @RequestParam(defaultValue = "0") Integer page,
                                                                  @RequestParam(defaultValue = "25") Integer size,
                                                                  @RequestParam SupplierStatusEnum status) throws DtoValidateException {
        return ResponseEntity.ok(supplierService.getAllByTenantIdAndStatus(tenantId, page, size, status));
    }

    @GetMapping("/{tenantId}/all-for-map")
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN})
    public ResponseEntity<List<SupplierForMapViewDto>> getAllByTenantIdForMap(@PathVariable UUID tenantId) throws DtoValidateException {
        return ResponseEntity.ok(supplierService.getAllByTenantIdForMap(tenantId));
    }

    @GetMapping("/pending")
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN})
    public ResponseEntity<List<SupplierViewDto>> getAllByTenantIdAndStatus(@RequestParam UUID tenantId,
                                                                           @RequestParam(defaultValue = "0") Integer page,
                                                                           @RequestParam(defaultValue = "25") Integer size,
                                                                           @RequestParam Set<SupplierStatusEnum> status) throws DtoValidateException {
        return ResponseEntity.ok(supplierService.getAllByTenantIdAndStatusIn(tenantId, page, size, status));
    }


    @GetMapping("/all/count")
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN})
    public ResponseEntity<Integer> countAllByTenantId(@RequestParam UUID tenantId,
                                                      @RequestParam Set<SupplierStatusEnum> statuses) throws DtoValidateException {
        return ResponseEntity.ok(supplierService.countAllByTenantIdAndStatus(tenantId, statuses));
    }

}
