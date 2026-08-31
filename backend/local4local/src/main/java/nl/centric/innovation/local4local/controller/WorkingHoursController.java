package nl.centric.innovation.local4local.controller;

import java.util.List;
import java.util.UUID;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.WorkingHoursDto;
import nl.centric.innovation.local4local.entity.Supplier;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.service.impl.SupplierService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import nl.centric.innovation.local4local.entity.Role;
import nl.centric.innovation.local4local.service.interfaces.WorkingHoursService;

@RestController
@RequestMapping("/working-hours")
@RequiredArgsConstructor
public class WorkingHoursController {

    private final WorkingHoursService workingHoursService;

    private final SupplierService supplierService;

    @PatchMapping("/{supplierId}")
    @Secured({Role.ROLE_SUPPLIER})
    public ResponseEntity<List<WorkingHoursDto>> editWorkingHours(@Valid @RequestBody List<WorkingHoursDto> workingHours,
                                                                  @PathVariable("supplierId") UUID supplierId)
            throws DtoValidateException {
        Supplier supplier = supplierService.getSupplierAndValidateOnPrincipal(supplierId);
        List<WorkingHoursDto> savedWorkingHours = workingHoursService.editAll(workingHours, supplier);
        return ResponseEntity.ok(savedWorkingHours);
    }

    @GetMapping("/{supplierId}")
    @Secured({Role.ROLE_SUPPLIER, Role.ROLE_SUPER_ADMIN})
    public ResponseEntity<List<WorkingHoursDto>> getWorkingHoursForSupplier(@PathVariable("supplierId") UUID supplierId)
            throws DtoValidateNotFoundException {
        supplierService.getSupplierAndValidateOnPrincipalOrSuperAdmin(supplierId);
        List<WorkingHoursDto> savedWorkingHours = workingHoursService.getWorkingHoursForSupplier(supplierId);
        return ResponseEntity.ok(savedWorkingHours);
    }

}
