package nl.centric.innovation.local4local.controller;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.AuditTimelineEventDto;
import nl.centric.innovation.local4local.entity.Role;
import nl.centric.innovation.local4local.exceptions.NotFoundException;
import nl.centric.innovation.local4local.service.impl.AuditSupplierService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("audit/")
@RequiredArgsConstructor
public class SupplierAuditController {

    private final AuditSupplierService auditSupplierService;

    @Operation(
            summary = "Get supplier audit history",
            description = """
                    Retrieves the full audit timeline for a supplier, including lifecycle events
                    such as application creation, submission, approval, rejection, and information edits.
                    Each event includes a timestamp, actor name, and detailed property changes where applicable.
                    Suppliers can only view their own audit trail; municipality admins can view suppliers in their tenant."""
    )
    @GetMapping("timeline/{supplierId}")
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN, Role.ROLE_SUPER_ADMIN, Role.ROLE_SUPPLIER})
    public ResponseEntity<List<AuditTimelineEventDto>> getSupplierTimeline(
            @PathVariable UUID supplierId) throws NotFoundException {

        List<AuditTimelineEventDto> events = auditSupplierService.getSupplierTimeline(supplierId);
        return ResponseEntity.ok(events);
    }
}
