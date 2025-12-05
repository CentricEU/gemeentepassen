package nl.centric.innovation.local4local.controller;

import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.TenantViewDto;
import nl.centric.innovation.local4local.entity.Tenant;
import nl.centric.innovation.local4local.service.interfaces.TenantService;
import nl.centric.innovation.local4local.util.ModelConverter;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/tenants")
public class TenantController {

    private final TenantService tenantService;

    private final Environment env;

    @GetMapping("/all")
    public ResponseEntity<List<TenantViewDto>> getAllTenants() {
        return ResponseEntity.ok(tenantService.getAllTenants());

    }

    @GetMapping("/{tenantId}")
    public ResponseEntity<TenantViewDto> getTenantById(@PathVariable("tenantId") UUID tenantId) {
        //Todo: move this to service
        Optional<Tenant> tenant = tenantService.findByTenantId(tenantId);

        if (tenant.isEmpty()) {

            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.ok(ModelConverter.entityToTenantViewDto(tenant.get()));

    }

    @PostMapping("/create")
    public ResponseEntity<TenantViewDto> saveTenant(@RequestBody Tenant tenant) {
        //Todo: Persistent entities should not be used as arguments of "@RequestMapping" methods
        try {
            TenantViewDto result = tenantService.save(tenant);
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.unprocessableEntity()
                    .header(env.getProperty("error.code.header"), env.getProperty("error.unique.violation")).build();
        }
    }
}
